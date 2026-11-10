import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Booking, Customer, Vehicle, Location, AgencySetting } from "@/models";
import { sendBookingWhatsAppNotification, getWhatsAppConfig, sanitizeWhatsAppNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/send-whatsapp
 * Body: { bookingReference: string, phone?: string }
 *
 * Sends confirmation WhatsApp message to the customer's phone
 * using the agency sender credentials/gateway configured in the admin dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { bookingReference, phone } = body;

    if (!bookingReference) {
      return NextResponse.json(
        { success: false, error: "Référence de réservation requise." },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      $or: [{ bookingReference }, { reference: bookingReference }],
    })
      .populate("customerId")
      .populate("vehicleId")
      .populate("pickupLocationId")
      .populate("returnLocationId")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    const customer: any = booking.customerId || {};
    const vehicle: any = booking.vehicleId || {};
    const pickupLoc: any = booking.pickupLocationId || {};
    const customerPhone = phone || customer.phone || "";

    if (!customerPhone) {
      return NextResponse.json(
        { success: false, error: "Numéro de téléphone destinataire manquant." },
        { status: 400 }
      );
    }

    const pickupLocName =
      (typeof pickupLoc.name === "object" ? pickupLoc.name?.fr : pickupLoc.name) ||
      pickupLoc.address ||
      "Agence";

    // Dispatch via WhatsApp Gateway (UltraMsg / GreenAPI / Meta)
    const result = await sendBookingWhatsAppNotification({
      ...booking,
      customerName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Client",
      customerPhone,
      vehicleName: `${vehicle.brand || ""} ${vehicle.model || ""}`.trim() || "Véhicule",
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      pickupLocation: pickupLocName,
      totalAmount: (booking as any).pricingBreakdown?.totalAmount || (booking as any).totalPrice || 0,
    });

    const targetClean = sanitizeWhatsAppNumber(customerPhone);
    const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://paylesscarrental.tn";
    const pdfUrl = `${siteUrl}/api/bookings/pdf?ref=${bookingReference}`;
    const directWaUrl = `https://wa.me/${targetClean}?text=${encodeURIComponent(
      `🚗 Payless Car Rental — Confirmation de Réservation ${bookingReference}\nFacture PDF : ${pdfUrl}`
    )}`;

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Message WhatsApp envoyé avec succès au ${customerPhone} !`,
        mode: "api",
        url: directWaUrl,
      });
    } else {
      // If gateway is in direct_link mode or not authenticated yet, return the fallback direct URL
      return NextResponse.json({
        success: true,
        mode: "direct_link",
        url: directWaUrl,
        message: `Lien WhatsApp direct généré pour le ${customerPhone}.`,
        notice: result.error,
      });
    }
  } catch (error: any) {
    console.error("send-whatsapp route error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erreur lors de l'envoi WhatsApp." },
      { status: 500 }
    );
  }
}
