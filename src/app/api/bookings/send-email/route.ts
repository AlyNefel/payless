import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Booking, Vehicle, Customer, Location, AgencySetting } from "@/models";
import { generateBookingPDF } from "@/lib/pdf";
import { buildBookingConfirmationEmail, sendEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { bookingReference, bookingId, email: targetEmail } = body;

    const query: Record<string, unknown> = {};
    if (bookingReference) {
      query.bookingReference = String(bookingReference).toUpperCase().trim();
    } else if (bookingId) {
      query._id = bookingId;
    } else {
      return NextResponse.json(
        { success: false, error: "Référence ou identifiant de réservation requis." },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne(query)
      .populate("vehicleId")
      .populate("vehicles.vehicleId")
      .populate("pickupLocationId")
      .populate("returnLocationId")
      .populate("customerId")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    const cust = booking.customerId as any;
    const vehicle = booking.vehicleId as any;
    const pickupLoc = booking.pickupLocationId as any;
    const returnLoc = booking.returnLocationId as any;

    const recipientEmail = (targetEmail || cust?.email || "").trim().toLowerCase();
    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Adresse email destinataire invalide." },
        { status: 400 }
      );
    }

    // Dynamic agency settings
    const settingsDocs = await AgencySetting.find({
      key: { $in: ["agencyName", "agency_name", "phone", "phone_primary", "email", "supportEmail", "address", "city"] },
    }).lean();

    const sMap: Record<string, string> = {};
    settingsDocs.forEach((s) => {
      sMap[s.key] = String(s.value || "");
    });

    const agencyName = sMap["agencyName"] || sMap["agency_name"] || "Payless Car Rental Tunisie";
    const agencyPhone = sMap["phone"] || sMap["phone_primary"] || "80808080";
    const agencyEmail = sMap["supportEmail"] || sMap["email"] || "contact@paylesscarrental.tn";
    const agencyAddress = sMap["address"] ? `${sMap["address"]}, ${sMap["city"] || "Ariana"}` : "60, Avenue de l'UMA, Chotrana 1, La Soukra, Ariana";

    const pickupLocName =
      typeof pickupLoc?.name === "object"
        ? pickupLoc.name.fr || pickupLoc.name.en || pickupLoc.address
        : pickupLoc?.name || pickupLoc?.address || "Aéroport Tunis-Carthage";

    const returnLocName =
      typeof returnLoc?.name === "object"
        ? returnLoc.name.fr || returnLoc.name.en || returnLoc.address
        : returnLoc?.name || returnLoc?.address || "Aéroport Tunis-Carthage";

    const customerName = `${cust?.firstName || "Client"} ${cust?.lastName || ""}`.trim();
    const customerLanguage = (cust?.preferredLanguage as "fr" | "en" | "ar") || "fr";

    const pdfVehicles =
      booking.vehicles && booking.vehicles.length > 0
        ? booking.vehicles.map((bv: any) => {
            const bvDoc = bv.vehicleId as any;
            return {
              brand: bv.brand || bvDoc?.brand || vehicle?.brand || "Véhicule",
              model: bv.model || bvDoc?.model || vehicle?.model || "Garanti",
              dailyRate: bv.dailyRate || booking.pricingBreakdown?.dailyRate || 0,
              subtotal: bv.subtotal || booking.pricingBreakdown?.subtotal || 0,
              rentalDuration: booking.rentalDuration,
              extrasTotal: bv.extras
                ? bv.extras.reduce(
                    (acc: number, ex: any) => acc + (ex.price || 0) * (ex.quantity || 1) * booking.rentalDuration,
                    0
                  )
                : 0,
              extrasNames: bv.extras ? bv.extras.map((ex: any) => `${ex.name} (x${ex.quantity})`) : [],
              depositAmount: bv.depositAmount || bvDoc?.pricing?.deposit,
            };
          })
        : undefined;

    // 1. Generate Black & White PDF Invoice Voucher
    const pdfBuffer = generateBookingPDF({
      bookingReference: booking.bookingReference,
      customerName,
      customerEmail: recipientEmail,
      customerPhone: cust?.phone || "",
      customerCountry: cust?.country || "Tunisie",
      drivingLicenceYear: (cust?.drivingLicence as any)?.issueYear,
      vehicleBrand: vehicle?.brand || "Véhicule",
      vehicleModel: vehicle?.model || "Garanti",
      vehicleYear: vehicle?.year,
      vehicles: pdfVehicles,
      pickupLocation: pickupLocName,
      returnLocation: returnLocName,
      pickupDate: formatDate(booking.pickupDate, "fr-FR"),
      returnDate: formatDate(booking.returnDate, "fr-FR"),
      rentalDuration: booking.rentalDuration,
      dailyRate: booking.pricingBreakdown?.dailyRate || 0,
      subtotal: booking.pricingBreakdown?.subtotal || 0,
      extrasTotal: booking.pricingBreakdown?.extrasTotal,
      discountAmount: booking.pricingBreakdown?.discountAmount,
      pickupLocationFee: booking.pricingBreakdown?.pickupLocationFee,
      returnLocationFee: booking.pricingBreakdown?.returnLocationFee,
      differentLocationFee: booking.pricingBreakdown?.differentLocationFee,
      outOfTownFee: booking.pricingBreakdown?.outOfTownFee,
      timbreFiscal: booking.pricingBreakdown?.timbreFiscal,
      contributionLF2026: booking.pricingBreakdown?.contributionLF2026,
      taxAmount: booking.pricingBreakdown?.taxAmount,
      totalAmount: booking.pricingBreakdown?.totalAmount || 0,
      depositAmount: booking.pricingBreakdown?.depositAmount,
      currency: booking.pricingBreakdown?.currency || "TND",
      agencyName,
      agencyPhone,
      agencyEmail,
      agencyAddress,
      createdAt: formatDate(booking.createdAt, "fr-FR"),
    });

    // 2. Build email body
    const emailData = buildBookingConfirmationEmail({
      customerName,
      bookingReference: booking.bookingReference,
      vehicleName: `${vehicle?.brand || "Véhicule"} ${vehicle?.model || "Garanti"}`,
      pickupLocation: pickupLocName,
      returnLocation: returnLocName,
      pickupDate: formatDate(booking.pickupDate, customerLanguage === "ar" ? "ar-TN" : "fr-FR"),
      returnDate: formatDate(booking.returnDate, customerLanguage === "ar" ? "ar-TN" : "fr-FR"),
      totalAmount: ((booking.pricingBreakdown?.totalAmount || 0) / 100).toLocaleString("fr-FR"),
      currency: "TND",
      language: customerLanguage,
      timbreFiscal: booking.pricingBreakdown?.timbreFiscal ? (booking.pricingBreakdown.timbreFiscal / 100).toLocaleString("fr-FR") : undefined,
      contributionLF2026: booking.pricingBreakdown?.contributionLF2026 ? (booking.pricingBreakdown.contributionLF2026 / 100).toLocaleString("fr-FR") : undefined,
      pickupLocationFee: booking.pricingBreakdown?.pickupLocationFee ? (booking.pricingBreakdown.pickupLocationFee / 100).toLocaleString("fr-FR") : undefined,
      differentLocationFee: booking.pricingBreakdown?.differentLocationFee ? (booking.pricingBreakdown.differentLocationFee / 100).toLocaleString("fr-FR") : undefined,
      outOfTownFee: booking.pricingBreakdown?.outOfTownFee ? (booking.pricingBreakdown.outOfTownFee / 100).toLocaleString("fr-FR") : undefined,
    });

    // 3. Send email with attached PDF
    const result = await sendEmail({
      to: recipientEmail,
      toName: customerName,
      subject: emailData.subject,
      html: emailData.html,
      templateType: "booking_confirmation_resend",
      language: customerLanguage,
      bookingId: booking._id.toString(),
      customerId: cust?._id?.toString(),
      attachments: [
        {
          filename: `Payless-Facture-${booking.bookingReference}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (!result.success) {
      console.warn("sendEmail returned unsuccessful:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Impossible d'envoyer l'email de confirmation.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Votre bon de réservation officiel et votre facture PDF ont été envoyés avec succès à ${recipientEmail}.`,
      recipient: recipientEmail,
    });
  } catch (error) {
    console.error("Error in POST /api/bookings/send-email:", error);
    return NextResponse.json(
      { success: false, error: "Échec de l'envoi de l'email de confirmation." },
      { status: 500 }
    );
  }
}

