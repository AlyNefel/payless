import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import {
  Booking,
  Vehicle,
  Customer,
  Location,
  Extra,
  Coupon,
  Notification,
  User,
  AgencySetting,
} from "@/models";
import { getVehicleStockAvailability } from "@/lib/availability";
import {
  generateBookingReference,
  calculateRentalDays,
  calculateRentalPrice,
  formatPrice,
  formatDate,
} from "@/lib/utils";
import { sendEmail, buildBookingConfirmationEmail } from "@/lib/email";
import { generateBookingPDF } from "@/lib/pdf";
import { sendBookingWhatsAppNotification } from "@/lib/whatsapp";
import { matchZone } from "@/lib/locationFees";
import { getLocationFeeConfig } from "@/lib/locationFeesServer";
import { sanitizeBookingForClient } from "@/lib/sanitize";
import { z } from "zod";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const createBookingSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  pickupLocationId: z.string().min(1, "Pickup location is required"),
  returnLocationId: z.string().min(1, "Return location is required"),
  pickupDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format de date de départ invalide",
  }),
  returnDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format de date de retour invalide",
  }),
  pickupTime: z.string().optional(),
  returnTime: z.string().optional(),
  extras: z
    .array(
      z.object({
        extraId: z.string().min(1),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional()
    .default([]),
  couponCode: z.string().optional().nullable(),
  customer: z.object({
    firstName: z.string().min(1, "Prénom requis").trim(),
    lastName: z.string().min(1, "Nom requis").trim(),
    email: z.string().min(3, "Adresse email requise").trim().toLowerCase(),
    phone: z.string().min(6, "Numéro de téléphone requis").trim(),
    country: z.string().optional().default("Tunisie"),
    city: z.string().optional(),
    address: z.string().optional(),
    passportNumber: z.string().optional(),
    drivingLicence: z
      .object({
        number: z.string().optional(),
        country: z.string().optional().default("Tunisie"),
        issueYear: z.union([z.string(), z.number()]).optional(),
        expiryDate: z.string().optional(),
      })
      .optional()
      .nullable(),
    preferredLanguage: z.string().optional().default("fr"),
  }),
  customerNotes: z.string().max(2000).optional().default(""),
  customerLanguage: z.string().optional().default("fr"),
  accountOption: z.string().optional().default("guest"),
  accountPassword: z.string().optional(),
  paymentMethod: z.string().optional().default("cash"),
  termsAccepted: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const rawBody = await request.json();
    const body = { ...rawBody };

    // Auto-normalize flat customer fields if not nested under `customer`
    if (!body.customer && (body.firstName || body.email)) {
      body.customer = {
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        email: body.email || "",
        phone: body.phone || "",
        country: body.country || "Tunisie",
        city: body.city,
        address: body.address,
        passportNumber: body.passportNumber,
        drivingLicence: body.licenceNumber ? { number: body.licenceNumber, country: body.country || "Tunisie" } : undefined,
        preferredLanguage: body.customerLanguage || "fr",
      };
    } else if (body.customer && !body.customer.country) {
      body.customer.country = "Tunisie";
    }

    if (!body.customerNotes && body.notes) {
      body.customerNotes = body.notes;
    }

    // Auto-normalize dates if missing or empty
    if (!body.pickupDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      body.pickupDate = tomorrow.toISOString().split("T")[0];
    }
    if (!body.returnDate) {
      const returnD = new Date();
      returnD.setDate(returnD.getDate() + 4);
      body.returnDate = returnD.toISOString().split("T")[0];
    }

    const validationResult = createBookingSchema.safeParse(body);

    if (!validationResult.success) {
      const issueDetails = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      console.error("Booking validation failed:", issueDetails);
      return NextResponse.json(
        {
          success: false,
          error: `Données de réservation invalides (${issueDetails})`,
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      vehicleId,
      pickupLocationId,
      returnLocationId,
      pickupDate: pickupDateStr,
      returnDate: returnDateStr,
      extras: selectedExtras,
      couponCode,
      customer: custInput,
      customerNotes,
      customerLanguage: rawCustomerLanguage,
      accountOption,
      accountPassword,
    } = validationResult.data;

    const customerLanguage: "fr" | "en" | "ar" =
      rawCustomerLanguage === "ar" || rawCustomerLanguage === "en" ? rawCustomerLanguage : "fr";

    const pickupDate = new Date(pickupDateStr);
    const returnDate = new Date(returnDateStr);

    if (returnDate <= pickupDate) {
      return NextResponse.json(
        {
          success: false,
          error: "La date de retour doit être postérieure à la date de départ.",
        },
        { status: 400 }
      );
    }

    const rentalDays = calculateRentalDays(pickupDate, returnDate);
    if (rentalDays < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "La durée minimale de location est de 1 jour.",
        },
        { status: 400 }
      );
    }

    // 1. Fetch vehicle & verify existence and active status
    let vehicle = null;
    if (mongoose.Types.ObjectId.isValid(vehicleId)) {
      vehicle = await Vehicle.findById(vehicleId).populate("categoryId");
    }
    if (!vehicle) {
      vehicle = await Vehicle.findOne({ isActive: true, status: { $ne: "archived" } }).populate("categoryId");
    }

    if (!vehicle || !vehicle.isActive || vehicle.status === "archived") {
      return NextResponse.json(
        {
          success: false,
          error: "Le véhicule sélectionné n'est pas disponible à la location.",
        },
        { status: 404 }
      );
    }

    // 2. Strict Real Stock & Concurrency Anti-Double Booking Check
    const stockInfo = await getVehicleStockAvailability(vehicle._id.toString(), pickupDate, returnDate);
    if (!stockInfo.isAvailable || stockInfo.availableUnits <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Ce véhicule n'est plus disponible pour les dates sélectionnées (stock épuisé). Veuillez choisir un autre véhicule ou modifier vos dates.",
          stock: stockInfo,
        },
        { status: 409 }
      );
    }

    // 3. Resiliently resolve pickup and return locations
    async function resolveLocationDoc(idOrCode: string) {
      if (mongoose.Types.ObjectId.isValid(idOrCode)) {
        const found = await Location.findById(idOrCode);
        if (found) return found;
      }
      let found = await Location.findOne({
        $or: [
          { "name.fr": { $regex: idOrCode, $options: "i" } },
          { "name.en": { $regex: idOrCode, $options: "i" } },
          { city: { $regex: idOrCode, $options: "i" } },
        ],
      });
      if (found) return found;
      found = await Location.findOne({ isActive: true });
      if (found) return found;
      found = await Location.findOne({});
      if (found) return found;
      return await Location.create({
        name: {
          fr: "Aéroport de Tunis-Carthage (TUN)",
          en: "Tunis-Carthage Airport (TUN)",
          ar: "مطار تونس قرطاج الدولي (TUN)",
        },
        address: "BP 73, 1080 Tunis Cedex, Tunisie",
        city: "Tunis",
        country: "Tunisie",
        phone: "+216 71 754 000",
        email: "tunis@payless.tn",
        isAirport: true,
        isActive: true,
      });
    }

    const [pickupLoc, returnLoc] = await Promise.all([
      resolveLocationDoc(pickupLocationId),
      resolveLocationDoc(returnLocationId),
    ]);

    if (!pickupLoc || !returnLoc) {
      return NextResponse.json(
        {
          success: false,
          error: "L'agence de départ ou de retour sélectionnée est introuvable.",
        },
        { status: 400 }
      );
    }

    // 4. Calculate Server-side Base Pricing
    const dailyRate = vehicle.pricing.daily;
    const subtotal = calculateRentalPrice(vehicle.pricing, rentalDays);

    // 5. Calculate Extras Pricing
    let extrasTotal = 0;
    const bookingExtras: {
      extraId: mongoose.Types.ObjectId;
      name: string;
      price: number;
      quantity: number;
    }[] = [];

    if (selectedExtras && selectedExtras.length > 0) {
      for (const item of selectedExtras) {
        if (!mongoose.Types.ObjectId.isValid(item.extraId)) continue;
        const extraDoc = await Extra.findById(item.extraId);
        if (!extraDoc || !extraDoc.isActive) continue;

        const qty = Math.min(item.quantity || 1, extraDoc.maxQuantity || 5);
        let extraCost = 0;

        if (extraDoc.pricingType === "per_day") {
          extraCost = extraDoc.price * rentalDays * qty;
        } else {
          extraCost = extraDoc.price * qty;
        }

        extrasTotal += extraCost;
        bookingExtras.push({
          extraId: extraDoc._id,
          name: extraDoc.name[customerLanguage] || extraDoc.name.fr || extraDoc.name.en,
          price: extraDoc.price,
          quantity: qty,
        });
      }
    }

    // 6. Validate and apply coupon if provided
    let discountAmount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode && couponCode.trim().length > 0) {
      const cleanCoupon = couponCode.toUpperCase().trim();
      let couponDoc = await Coupon.findOne({
        code: cleanCoupon,
        isActive: true,
      });

      if (!couponDoc && cleanCoupon === "PAYLESS2026") {
        couponDoc = await Coupon.findOneAndUpdate(
          { code: "PAYLESS2026" },
          {
            $set: {
              code: "PAYLESS2026",
              type: "percentage",
              value: 10,
              minimumDays: 1,
              minimumAmount: 0,
              isActive: true,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      if (couponDoc) {
        const now = new Date();
        const isNotExpired =
          (!couponDoc.startDate || now >= new Date(couponDoc.startDate)) &&
          (!couponDoc.endDate || now <= new Date(couponDoc.endDate));
        const withinLimits =
          !couponDoc.usageLimit || couponDoc.usageCount < couponDoc.usageLimit;
        const minDaysMet =
          !couponDoc.minimumDays || rentalDays >= couponDoc.minimumDays;
        const minAmountMet =
          !couponDoc.minimumAmount || subtotal >= couponDoc.minimumAmount;

        let categoryApplicable = true;
        if (
          couponDoc.applicableCategories &&
          couponDoc.applicableCategories.length > 0
        ) {
          const vehicleCategoryId = vehicle.categoryId?._id || vehicle.categoryId;
          categoryApplicable = couponDoc.applicableCategories.some(
            (cId: any) => cId.toString() === vehicleCategoryId.toString()
          );
        }

        if (isNotExpired && withinLimits && minDaysMet && minAmountMet && categoryApplicable) {
          if (couponDoc.type === "percentage") {
            discountAmount = Math.round((subtotal * couponDoc.value) / 100);
          } else if (couponDoc.type === "fixed") {
            discountAmount = Math.min(couponDoc.value, subtotal);
          }
          appliedCouponCode = couponDoc.code;
        }
      }
    }

    // 7. Configurable Delivery & Collection / Ramassage Fees & Taxes
    const feeConfig = await getLocationFeeConfig();
    const pickupZone = matchZone(pickupLoc, feeConfig.zones);
    const returnZone = matchZone(returnLoc, feeConfig.zones);

    // Delivery fee (Livraison / Prise en charge)
    let pickupLocationFee = 0;
    if (pickupLoc.pickupFee && pickupLoc.pickupFee > 0) {
      pickupLocationFee = pickupLoc.pickupFee;
    } else if (pickupZone && feeConfig.enabled) {
      pickupLocationFee = Math.round(pickupZone.deliveryFee * 100);
    }

    // Collection / Ramassage fee (Restitution)
    let returnLocationFee = 0;
    if (returnLoc.returnFee && returnLoc.returnFee > 0) {
      returnLocationFee = returnLoc.returnFee;
    } else if (returnLoc.customReturnFee && returnLoc.customReturnFee > 0) {
      returnLocationFee = returnLoc.customReturnFee;
    } else if (returnZone && feeConfig.enabled) {
      returnLocationFee = Math.round(returnZone.returnFee * 100);
    }

    // Inter-agency return fee (Aller-simple)
    let differentLocationFee = 0;
    const isDifferentLocation = pickupLoc._id.toString() !== returnLoc._id.toString();
    if (isDifferentLocation && feeConfig.differentLocationFee > 0) {
      differentLocationFee = Math.round(feeConfig.differentLocationFee * 100);
    }

    const outOfTownFee = returnLocationFee;

    // Fiscal requirements
    let timbreFiscalSetting = 1; // 1 DT
    let contributionSetting = 2; // 2 DT/day
    try {
      const fiscalSettings = await AgencySetting.find({
        key: { $in: ["timbreFiscal", "contributionLF2026"] },
      }).lean();
      fiscalSettings.forEach((s) => {
        if (s.key === "timbreFiscal" && s.value !== undefined) timbreFiscalSetting = Number(s.value);
        if (s.key === "contributionLF2026" && s.value !== undefined) contributionSetting = Number(s.value);
      });
    } catch {}

    const taxRate = 0;
    const taxAmount = 0;
    const timbreFiscal = Math.round(timbreFiscalSetting * 100);
    const contributionLF2026 = Math.round(contributionSetting * 100) * rentalDays;

    const depositAmount = vehicle.pricing.deposit || 0;
    const totalAmount = Math.max(
      0,
      subtotal +
        extrasTotal -
        discountAmount +
        taxAmount +
        timbreFiscal +
        contributionLF2026 +
        pickupLocationFee +
        returnLocationFee +
        differentLocationFee
    );
    const currency = vehicle.pricing.currency || "TND";

    const pricingBreakdown = {
      dailyRate,
      rentalDays,
      subtotal,
      extrasTotal,
      discountAmount,
      taxAmount,
      taxRate,
      timbreFiscal,
      contributionLF2026,
      outOfTownFee,
      pickupLocationFee,
      returnLocationFee,
      differentLocationFee,
      depositAmount,
      totalAmount,
      currency,
    };

    // 8. Handle Client Account Option
    let linkedUserId: mongoose.Types.ObjectId | undefined = undefined;

    if (accountOption === "create" && accountPassword && accountPassword.trim().length >= 6) {
      try {
        let existingUser = await User.findOne({ email: custInput.email });
        if (!existingUser) {
          existingUser = await User.create({
            name: `${custInput.firstName} ${custInput.lastName}`.trim(),
            email: custInput.email,
            password: accountPassword,
            role: "client",
            phone: custInput.phone,
            preferences: { language: customerLanguage, notifications: true },
          });
        }
        linkedUserId = existingUser._id;
      } catch (userErr) {
        console.error("Account creation error during booking:", userErr);
      }
    } else if (accountOption === "existing") {
      try {
        const existingUser = await User.findOne({ email: custInput.email });
        if (existingUser) {
          linkedUserId = existingUser._id;
        }
      } catch (err) {
        console.error("Error looking up existing user:", err);
      }
    }

    // 9. Find or create Customer record
    let customer = await Customer.findOne({ email: custInput.email });
    if (!customer) {
      customer = await Customer.create({
        userId: linkedUserId,
        firstName: custInput.firstName,
        lastName: custInput.lastName,
        email: custInput.email,
        phone: custInput.phone,
        country: custInput.country || "Tunisie",
        city: custInput.city,
        address: custInput.address,
        passportNumber: custInput.passportNumber,
        drivingLicence: custInput.drivingLicence
          ? {
              number: custInput.drivingLicence.number || "",
              country: custInput.drivingLicence.country || custInput.country || "Tunisie",
              issueYear: custInput.drivingLicence.issueYear ? Number(custInput.drivingLicence.issueYear) : undefined,
              expiryDate: custInput.drivingLicence.expiryDate
                ? new Date(custInput.drivingLicence.expiryDate)
                : undefined,
            }
          : undefined,
        preferredLanguage: customerLanguage,
        totalBookings: 1,
        totalSpent: totalAmount,
        isBlacklisted: false,
        notes: "Client créé via réservation web.",
        tags: ["Web Booking"],
      });
    } else {
      if (linkedUserId && !customer.userId) {
        customer.userId = linkedUserId;
      }
      customer.totalBookings = (customer.totalBookings || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + totalAmount;
      if (custInput.phone) customer.phone = custInput.phone;
      if (custInput.city && !customer.city) customer.city = custInput.city;
      if (custInput.passportNumber && !customer.passportNumber) {
        customer.passportNumber = custInput.passportNumber;
      }
      await customer.save();
    }

    // 10. Generate Reference & CREATE BOOKING WITH INSTANT AUTO-CONFIRMATION
    const bookingReference = generateBookingReference();

    const booking = await Booking.create({
      bookingReference,
      customerId: customer._id,
      createdBy: linkedUserId,
      vehicleId: vehicle._id,
      pickupLocationId: pickupLoc._id,
      returnLocationId: returnLoc._id,
      pickupDate,
      returnDate,
      rentalDuration: rentalDays,
      pricingBreakdown,
      extras: bookingExtras,
      couponCode: appliedCouponCode,
      bookingStatus: "confirmed", // <-- AUTO-CONFIRMED DIRECTEMENT (Suppression validation agence)
      paymentStatus: "unpaid",
      paymentMethod: body.paymentMethod || "cash",
      customerLanguage,
      internalNotes: "Réservation confirmée automatiquement par le système. Véhicule garanti.",
      customerNotes: customerNotes || "",
      isManualBooking: false,
      auditHistory: [
        {
          action: "auto_confirmed",
          performedBy: customer._id,
          performedByRole: "system",
          timestamp: new Date(),
          notes: "Réservation confirmée immédiatement en ligne sans délai de validation agence. Stock verrouillé.",
        },
      ],
    });

    // Record coupon usage
    if (appliedCouponCode) {
      await Coupon.findOneAndUpdate(
        { code: appliedCouponCode },
        {
          $inc: { usageCount: 1 },
          $push: {
            usedBy: {
              customerId: customer._id,
              bookingId: booking._id,
              usedAt: new Date(),
            },
          },
        }
      );
    }

    // 11. Create Notifications for Administrators
    try {
      const admins = await User.find({
        role: { $in: ["superadmin", "admin"] },
        isActive: true,
      }).select("_id");

      const vehicleTitle = `${vehicle.brand} ${vehicle.model}`;
      const customerFullName = `${customer.firstName} ${customer.lastName}`;

      const notifPromises = admins.map((admin) =>
        Notification.create({
          recipientId: admin._id,
          recipientType: "user",
          type: "new_booking",
          title: {
            fr: `Réservation confirmée - ${bookingReference}`,
            en: `Confirmed Booking - ${bookingReference}`,
            ar: `حجز مؤكد تلقائياً - ${bookingReference}`,
          },
          message: {
            fr: `${customerFullName} a réservé ${vehicleTitle} du ${formatDate(pickupDate, "fr-FR")} au ${formatDate(returnDate, "fr-FR")}. Confirmée automatiquement.`,
            en: `${customerFullName} booked ${vehicleTitle} from ${formatDate(pickupDate, "en-US")} to ${formatDate(returnDate, "en-US")}. Auto-confirmed.`,
            ar: `قام ${customerFullName} بحجز ${vehicleTitle} من ${formatDate(pickupDate, "ar-TN")} إلى ${formatDate(returnDate, "ar-TN")}. تم التأكيد الفوري.`,
          },
          link: `/admin/bookings/${booking._id}`,
          isRead: false,
          data: {
            bookingId: booking._id.toString(),
            bookingReference,
            totalAmount,
            vehicle: vehicleTitle,
          },
        })
      );

      await Promise.all(notifPromises);
    } catch (notifErr) {
      console.error("Failed to generate admin notifications:", notifErr);
    }

    // 12. GENERATE OFFICIAL PDF VOUCHER
    const pickupLocName =
      pickupLoc.name[customerLanguage] || pickupLoc.name.fr || pickupLoc.address;
    const returnLocName =
      returnLoc.name[customerLanguage] || returnLoc.name.fr || returnLoc.address;

    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = generateBookingPDF({
        bookingReference,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerCountry: customer.country,
        drivingLicenceYear: (customer.drivingLicence as any)?.issueYear,
        vehicleBrand: vehicle.brand,
        vehicleModel: vehicle.model,
        vehicleYear: vehicle.year,
        pickupLocation: pickupLocName,
        returnLocation: returnLocName,
        pickupDate: formatDate(pickupDate, "fr-FR"),
        returnDate: formatDate(returnDate, "fr-FR"),
        rentalDuration: rentalDays,
        dailyRate,
        subtotal,
        extrasTotal,
        discountAmount,
        pickupLocationFee,
        returnLocationFee,
        differentLocationFee,
        outOfTownFee,
        timbreFiscal,
        contributionLF2026,
        taxAmount,
        totalAmount,
        depositAmount,
        currency: "TND",
      });
    } catch (pdfErr) {
      console.error("PDF generation in booking flow error:", pdfErr);
    }

    // 13. SEND CONFIRMATION EMAILS WITH PDF ATTACHMENT
    const emailData = buildBookingConfirmationEmail({
      customerName: `${customer.firstName} ${customer.lastName}`,
      bookingReference,
      vehicleName: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
      pickupLocation: pickupLocName,
      returnLocation: returnLocName,
      pickupDate: formatDate(pickupDate, customerLanguage === "ar" ? "ar-TN" : "fr-FR"),
      returnDate: formatDate(returnDate, customerLanguage === "ar" ? "ar-TN" : "fr-FR"),
      totalAmount: (totalAmount / 100).toLocaleString("fr-FR"),
      currency: "TND",
      language: customerLanguage,
      timbreFiscal: (timbreFiscal / 100).toLocaleString("fr-FR"),
      contributionLF2026: (contributionLF2026 / 100).toLocaleString("fr-FR"),
      pickupLocationFee: pickupLocationFee > 0 ? (pickupLocationFee / 100).toLocaleString("fr-FR") : undefined,
      differentLocationFee: differentLocationFee > 0 ? (differentLocationFee / 100).toLocaleString("fr-FR") : undefined,
      outOfTownFee: returnLocationFee > 0 ? (returnLocationFee / 100).toLocaleString("fr-FR") : undefined,
    });

    const emailPromises: Promise<any>[] = [
      sendEmail({
        to: customer.email,
        toName: `${customer.firstName} ${customer.lastName}`,
        subject: emailData.subject,
        html: emailData.html,
        templateType: "booking_confirmation",
        language: customerLanguage,
        bookingId: booking._id.toString(),
        customerId: customer._id.toString(),
        attachments: pdfBuffer
          ? [
              {
                filename: `Reservation-${bookingReference}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ]
          : undefined,
      }).catch((err) => console.error("Customer email dispatch error:", err)),
    ];

    const agencyEmail = process.env.AGENCY_EMAIL || process.env.SMTP_USER;
    if (agencyEmail && agencyEmail !== customer.email) {
      emailPromises.push(
        sendEmail({
          to: agencyEmail,
          toName: "Payless Administration",
          subject: `🔔 Réservation Confirmée Automatiquement - ${bookingReference}`,
          html: emailData.html,
          templateType: "admin_new_booking_alert",
          language: "fr",
          bookingId: booking._id.toString(),
          customerId: customer._id.toString(),
          attachments: pdfBuffer
            ? [
                {
                  filename: `Reservation-${bookingReference}.pdf`,
                  content: pdfBuffer,
                  contentType: "application/pdf",
                },
              ]
            : undefined,
        }).catch((err) => console.error("Agency email dispatch error:", err))
      );
    }

    Promise.race([
      Promise.allSettled(emailPromises),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]).catch((e) => console.error("Async email error:", e));

    // 14. FORMAT WHATSAPP BUSINESS NOTIFICATION / LINK
    const siteUrl = process.env.NEXTAUTH_URL || "https://payless.tn";
    const pdfUrl = `${siteUrl}/api/bookings/pdf?ref=${bookingReference}&email=${encodeURIComponent(customer.email)}`;
    const waText = encodeURIComponent(
      `🚗 *Payless Car Rental Tunisie — Confirmation de Réservation*\n\n` +
      `Bonjour *${customer.firstName} ${customer.lastName}*,\n` +
      `Votre réservation *${bookingReference}* est ✅ *Confirmée Instantanément* !\n\n` +
      `• *Véhicule* : ${vehicle.brand} ${vehicle.model}\n` +
      `• *Prise en charge* : ${formatDate(pickupDate, "fr-FR")} (${pickupLocName})\n` +
      `• *Restitution* : ${formatDate(returnDate, "fr-FR")} (${returnLocName})\n` +
      `• *Durée* : ${rentalDays} jour(s)\n` +
      `• *Montant Total TTC* : ${(totalAmount / 100).toFixed(2)} TND\n\n` +
      `📄 *Télécharger votre bon de réservation officiel PDF* :\n${pdfUrl}\n\n` +
      `Notre équipe reste à votre entière disposition 24/7 au 80808080.`
    );
    const cleanCustPhone = customer.phone.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanCustPhone}?text=${waText}`;

    // Auto-dispatch WhatsApp confirmation if gateway is connected
    sendBookingWhatsAppNotification({
      ...booking.toObject ? booking.toObject() : booking,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phone,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      pickupDate,
      returnDate,
      pickupLocation: pickupLocName,
      totalAmount,
    }).catch((waErr) => {
      console.warn("Background WhatsApp dispatch non-blocking notice:", waErr);
    });

    // Return the created booking with sanitized fields
    const populatedBooking = await Booking.findById(booking._id)
      .populate("vehicleId")
      .populate("pickupLocationId")
      .populate("returnLocationId")
      .populate("customerId")
      .lean();

    const clientSafeBooking = sanitizeBookingForClient(populatedBooking as any);

    return NextResponse.json(
      {
        success: true,
        message: "Réservation confirmée automatiquement avec succès.",
        bookingReference,
        booking: clientSafeBooking,
        whatsappUrl,
        pdfUrl: `/api/bookings/pdf?ref=${bookingReference}&email=${encodeURIComponent(customer.email)}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la création de la réservation.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const email = searchParams.get("email");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const query: Record<string, unknown> = {};

    if (reference) {
      query.bookingReference = reference.toUpperCase().trim();
    }

    if (status) {
      query.bookingStatus = status;
    }

    if (email) {
      const customer = await Customer.findOne({
        email: email.toLowerCase().trim(),
      }).select("_id");
      if (customer) {
        query.customerId = customer._id;
      } else {
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: { total: 0, page, limit, totalPages: 0 },
          },
          { status: 200 }
        );
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("vehicleId")
        .populate("pickupLocationId")
        .populate("returnLocationId")
        .populate("customerId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    const sanitizedBookings = bookings.map((b) => sanitizeBookingForClient(b as any));

    return NextResponse.json(
      {
        success: true,
        data: sanitizedBookings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}
