import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Booking, Vehicle, Customer, Location, AgencySetting } from "@/models";
import { generateBookingPDF } from "@/lib/pdf";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref") || searchParams.get("reference");
    const bookingId = searchParams.get("id");
    const email = searchParams.get("email");

    const query: Record<string, unknown> = {};
    if (ref) query.bookingReference = ref.toUpperCase().trim();
    else if (bookingId) query._id = bookingId;
    else {
      return NextResponse.json({ error: "Référence ou ID de réservation requis" }, { status: 400 });
    }

    const booking = await Booking.findOne(query)
      .populate("vehicleId")
      .populate("pickupLocationId")
      .populate("returnLocationId")
      .populate("customerId")
      .lean();

    if (!booking) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }

    // Optional email validation if supplied
    if (email) {
      const cust = booking.customerId as any;
      if (cust?.email && cust.email.toLowerCase() !== email.toLowerCase().trim()) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
    }

    // Fetch dynamic agency settings
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

    const v = booking.vehicleId as any;
    const cust = booking.customerId as any;
    const pLoc = booking.pickupLocationId as any;
    const rLoc = booking.returnLocationId as any;

    const pLocName = typeof pLoc?.name === "object" ? pLoc.name.fr || pLoc.name.en : pLoc?.name || pLoc?.address || "Aéroport Tunis-Carthage";
    const rLocName = typeof rLoc?.name === "object" ? rLoc.name.fr || rLoc.name.en : rLoc?.name || rLoc?.address || "Aéroport Tunis-Carthage";

    const pdfBuffer = generateBookingPDF({
      bookingReference: booking.bookingReference,
      customerName: `${cust?.firstName || "Client"} ${cust?.lastName || ""}`.trim(),
      customerEmail: cust?.email || "",
      customerPhone: cust?.phone || "",
      customerCountry: cust?.country || "Tunisie",
      drivingLicenceYear: (cust?.drivingLicence as any)?.issueYear,
      vehicleBrand: v?.brand || "Véhicule",
      vehicleModel: v?.model || "Garanti",
      vehicleYear: v?.year || new Date().getFullYear(),
      pickupLocation: pLocName,
      returnLocation: rLocName,
      pickupDate: formatDate(booking.pickupDate, "fr-FR"),
      returnDate: formatDate(booking.returnDate, "fr-FR"),
      rentalDuration: booking.rentalDuration,
      dailyRate: booking.pricingBreakdown.dailyRate,
      subtotal: booking.pricingBreakdown.subtotal,
      extrasTotal: booking.pricingBreakdown.extrasTotal,
      discountAmount: booking.pricingBreakdown.discountAmount,
      pickupLocationFee: booking.pricingBreakdown.pickupLocationFee,
      returnLocationFee: booking.pricingBreakdown.returnLocationFee,
      differentLocationFee: booking.pricingBreakdown.differentLocationFee,
      outOfTownFee: booking.pricingBreakdown.outOfTownFee,
      timbreFiscal: booking.pricingBreakdown.timbreFiscal,
      contributionLF2026: booking.pricingBreakdown.contributionLF2026,
      taxAmount: booking.pricingBreakdown.taxAmount,
      totalAmount: booking.pricingBreakdown.totalAmount,
      depositAmount: booking.pricingBreakdown.depositAmount,
      currency: booking.pricingBreakdown.currency || "TND",
      agencyName,
      agencyPhone,
      agencyEmail,
      agencyAddress,
      createdAt: formatDate(booking.createdAt, "fr-FR"),
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Payless-Facture-${booking.bookingReference}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Erreur lors de la génération du bon PDF" }, { status: 500 });
  }
}

