import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Booking, Vehicle, Customer, Location, Notification, User } from "@/models";
import { sendEmail } from "@/lib/email";
import { calculateRentalDays, calculateRentalPrice, formatDate } from "@/lib/utils";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const {
      reference,
      email,
      pickupDate: rawPickupDate,
      returnDate: rawReturnDate,
      pickupTime,
      returnTime,
      pickupLocationId,
      returnLocationId,
      customerNotes,
      reason,
    } = body;

    // 1. Fetch booking with customer
    const query: Record<string, unknown> = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else if (reference) {
      query.bookingReference = reference.toUpperCase().trim();
    } else {
      return NextResponse.json({ success: false, error: "Identifiant ou référence requis" }, { status: 400 });
    }

    const booking = await Booking.findOne(query)
      .populate("customerId")
      .populate("vehicleId")
      .populate("pickupLocationId")
      .populate("returnLocationId");

    if (!booking) {
      return NextResponse.json({ success: false, error: "Réservation introuvable" }, { status: 404 });
    }

    // Verify security: check email or phone matches customer
    const customer = booking.customerId as unknown as { email?: string; phone?: string; firstName?: string; lastName?: string } | null;
    if (email && customer?.email) {
      if (customer.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
        return NextResponse.json({ success: false, error: "Email non correspondant à cette réservation." }, { status: 403 });
      }
    }

    const isPending = booking.bookingStatus === "pending";
    const isConfirmed = booking.bookingStatus === "confirmed";

    if (!isPending && !isConfirmed) {
      return NextResponse.json(
        {
          success: false,
          error: `Les modifications ne sont pas autorisées pour une réservation avec le statut actuel (${booking.bookingStatus}).`,
        },
        { status: 400 }
      );
    }

    const newPickupDate = rawPickupDate ? new Date(rawPickupDate) : booking.pickupDate;
    const newReturnDate = rawReturnDate ? new Date(rawReturnDate) : booking.returnDate;

    if (newReturnDate.getTime() <= newPickupDate.getTime()) {
      return NextResponse.json(
        { success: false, error: "La date de retour doit être postérieure à la date de départ." },
        { status: 400 }
      );
    }

    // Find admin user to link notification to
    const adminUser = await User.findOne({ role: { $in: ["admin", "superadmin", "manager"] } }).select("_id");
    const adminRecipientId = adminUser?._id || new mongoose.Types.ObjectId();

    // -------------------------------------------------------------
    // CASE A: IF STATUS IS "pending" (Not yet confirmed by agency)
    // Direct modification applied, recalculates price if dates changed, and notifies admin
    // -------------------------------------------------------------
    if (isPending) {
      const oldPickupDateStr = formatDate(booking.pickupDate, "fr-FR");
      const oldReturnDateStr = formatDate(booking.returnDate, "fr-FR");

      // Recalculate duration & price if dates changed
      const oldRentalDays = booking.rentalDuration;
      const newRentalDays = Math.max(1, calculateRentalDays(newPickupDate, newReturnDate));

      const vehicle = booking.vehicleId as unknown as { pricing?: { daily: number; weekly: number; monthly: number } } | null;
      let newTotal = booking.pricingBreakdown.totalAmount;
      let newSubtotal = booking.pricingBreakdown.subtotal;
      let newContribution = booking.pricingBreakdown.contributionLF2026 || (200 * newRentalDays);

      if (vehicle?.pricing && newRentalDays !== oldRentalDays) {
        newSubtotal = calculateRentalPrice(vehicle.pricing, newRentalDays);
        const timbre = booking.pricingBreakdown.timbreFiscal ?? 100;
        newContribution = 200 * newRentalDays; // 2 DT per day in minor units
        const extrasTotal = booking.pricingBreakdown.extrasTotal || 0;
        const discount = booking.pricingBreakdown.discountAmount || 0;
        newTotal = Math.max(0, newSubtotal + extrasTotal + timbre + newContribution - discount);
      }

      booking.pickupDate = newPickupDate;
      booking.returnDate = newReturnDate;
      booking.rentalDuration = newRentalDays;
      if (pickupTime) (booking as unknown as { pickupTime?: string }).pickupTime = pickupTime;
      if (returnTime) (booking as unknown as { returnTime?: string }).returnTime = returnTime;
      if (pickupLocationId && mongoose.Types.ObjectId.isValid(pickupLocationId)) {
        booking.pickupLocationId = new mongoose.Types.ObjectId(pickupLocationId);
      }
      if (returnLocationId && mongoose.Types.ObjectId.isValid(returnLocationId)) {
        booking.returnLocationId = new mongoose.Types.ObjectId(returnLocationId);
      }
      if (customerNotes !== undefined) {
        booking.customerNotes = customerNotes;
      }

      booking.pricingBreakdown.rentalDays = newRentalDays;
      booking.pricingBreakdown.subtotal = newSubtotal;
      booking.pricingBreakdown.contributionLF2026 = newContribution;
      booking.pricingBreakdown.totalAmount = newTotal;

      booking.auditHistory.push({
        action: "Client a directement modifié sa réservation en attente",
        performedBy: customer?.email || "Client",
        performedByRole: "client",
        timestamp: new Date(),
        notes: `Dates modifiées de [${oldPickupDateStr} - ${oldReturnDateStr}] à [${formatDate(newPickupDate, "fr-FR")} - ${formatDate(newReturnDate, "fr-FR")}]. Motif: ${reason || "Modification directe"}`,
      });

      await booking.save();

      // Create Admin In-App Notification
      try {
        await Notification.create({
          recipientId: adminRecipientId,
          recipientType: "user",
          type: "booking_modified_by_customer",
          title: {
            fr: `Modification réservation ${booking.bookingReference}`,
            en: `Booking Modified: ${booking.bookingReference}`,
            ar: `تعديل الحجز: ${booking.bookingReference}`,
          },
          message: {
            fr: `Le client ${customer?.firstName || ""} ${customer?.lastName || ""} a modifié sa réservation (${booking.bookingReference}) avant confirmation. Nouvelles dates: du ${formatDate(newPickupDate, "fr-FR")} au ${formatDate(newReturnDate, "fr-FR")}.`,
            en: `Customer ${customer?.firstName || ""} ${customer?.lastName || ""} directly updated pending booking ${booking.bookingReference}.`,
            ar: `قام العميل بتعديل الحجز رقم ${booking.bookingReference} في انتظار التأكيد.`,
          },
          link: `/admin/bookings/${booking._id}`,
          isRead: false,
          data: {
            bookingId: booking._id,
            bookingReference: booking.bookingReference,
            type: "direct_modification",
          },
        });
      } catch (notifErr) {
        console.error("Failed to create admin notification:", notifErr);
      }

      // Notify agency via email asynchronously
      try {
        const agencyEmail = process.env.AGENCY_NOTIFICATION_EMAIL || process.env.SMTP_USER || "hmlrentcar@gmail.com";
        sendEmail({
          to: agencyEmail,
          toName: "Payless Administration",
          subject: `🔔 Réservation modifiée par le client : ${booking.bookingReference}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #1d4ed8;">Réservation modifiée par le client (Statut: En Attente)</h2>
              <p>Le client <strong>${customer?.firstName || ""} ${customer?.lastName || ""}</strong> (${customer?.phone || ""}) a mis à jour les détails de sa réservation <strong>${booking.bookingReference}</strong>.</p>
              <ul>
                <li><strong>Nouvelle prise en charge :</strong> ${formatDate(newPickupDate, "fr-FR")} ${pickupTime || ""}</li>
                <li><strong>Nouvelle restitution :</strong> ${formatDate(newReturnDate, "fr-FR")} ${returnTime || ""}</li>
                <li><strong>Nouvelle durée :</strong> ${newRentalDays} jour(s)</li>
                <li><strong>Nouveau Total TTC :</strong> ${((newTotal || 0) / 100).toLocaleString("fr-FR")} TND</li>
                ${reason ? `<li><strong>Motif du client :</strong> ${reason}</li>` : ""}
              </ul>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/admin/bookings/${booking._id}" style="display:inline-block; padding:10px 20px; background:#1d4ed8; color:#fff; text-decoration:none; border-radius:8px;">Voir la réservation dans le dashboard</a></p>
            </div>
          `,
          templateType: "booking_modified",
        }).catch((e) => console.error("Agency email dispatch error:", e));
      } catch (mailErr) {
        console.error("Mail error:", mailErr);
      }

      return NextResponse.json({
        success: true,
        mode: "direct_applied",
        message: "Votre réservation a été modifiée avec succès. Notre équipe en a été immédiatement notifiée.",
        booking,
      });
    }

    // -------------------------------------------------------------
    // CASE B: IF STATUS IS "confirmed"
    // Reservation is locked by agency: creates a formal Modification Request that admin must review & approve/reject
    // -------------------------------------------------------------
    if (isConfirmed) {
      booking.modificationRequest = {
        status: "pending",
        requestedAt: new Date(),
        pickupDate: newPickupDate,
        returnDate: newReturnDate,
        pickupTime: pickupTime || undefined,
        returnTime: returnTime || undefined,
        pickupLocationId: pickupLocationId && mongoose.Types.ObjectId.isValid(pickupLocationId) ? new mongoose.Types.ObjectId(pickupLocationId) : undefined,
        returnLocationId: returnLocationId && mongoose.Types.ObjectId.isValid(returnLocationId) ? new mongoose.Types.ObjectId(returnLocationId) : undefined,
        customerNotes: customerNotes || undefined,
        reason: reason || "Demande de modification envoyée par le client",
      };

      booking.auditHistory.push({
        action: "Demande de modification soumise par le client (En attente d'approbation agence)",
        performedBy: customer?.email || "Client",
        performedByRole: "client",
        timestamp: new Date(),
        notes: `Demande de changement de dates: ${formatDate(newPickupDate, "fr-FR")} au ${formatDate(newReturnDate, "fr-FR")}. Motif: ${reason || "Non spécifié"}`,
      });

      await booking.save();

      // Create High-Priority Admin Notification
      try {
        await Notification.create({
          recipientId: adminRecipientId,
          recipientType: "user",
          type: "booking_modification_request",
          title: {
            fr: `⚠️ Demande de modification : ${booking.bookingReference}`,
            en: `⚠️ Modification Requested: ${booking.bookingReference}`,
            ar: `⚠️ طلب تعديل حجز: ${booking.bookingReference}`,
          },
          message: {
            fr: `Le client ${customer?.firstName || ""} ${customer?.lastName || ""} demande à modifier sa réservation confirmée ${booking.bookingReference}. Veuillez accepter ou refuser dans le tableau de bord.`,
            en: `Customer requested modifications for confirmed booking ${booking.bookingReference}. Approval required.`,
            ar: `طلب العميل تعديل موعد الحجز المؤكد ${booking.bookingReference}. يتطلب موافقة الإدارة.`,
          },
          link: `/admin/bookings/${booking._id}`,
          isRead: false,
          data: {
            bookingId: booking._id,
            bookingReference: booking.bookingReference,
            type: "approval_required",
          },
        });
      } catch (notifErr) {
        console.error("Failed to create admin notification:", notifErr);
      }

      // Notify agency via email
      try {
        const agencyEmail = process.env.AGENCY_NOTIFICATION_EMAIL || process.env.SMTP_USER || "hmlrentcar@gmail.com";
        sendEmail({
          to: agencyEmail,
          toName: "Payless Direction",
          subject: `⚠️ Demande de modification pour la réservation confirmée : ${booking.bookingReference}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #b45309;">Demande d'approbation de modification requise</h2>
              <p>Le client <strong>${customer?.firstName || ""} ${customer?.lastName || ""}</strong> (${customer?.phone || ""}) souhaite modifier sa réservation confirmée <strong>${booking.bookingReference}</strong>.</p>
              <div style="background:#fef3c7; border:1px solid #f59e0b; padding:15px; border-radius:8px;">
                <p><strong>Nouvelles dates souhaitées :</strong> du ${formatDate(newPickupDate, "fr-FR")} au ${formatDate(newReturnDate, "fr-FR")}</p>
                ${reason ? `<p><strong>Motif invoqué :</strong> ${reason}</p>` : ""}
              </div>
              <p style="margin-top:20px;">Veuillez vous rendre dans le tableau de bord pour <strong>Accepter</strong> ou <strong>Refuser</strong> cette modification :</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/admin/bookings/${booking._id}" style="display:inline-block; padding:12px 24px; background:#1d4ed8; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">Traiter la demande sur le Dashboard</a></p>
            </div>
          `,
          templateType: "booking_modified",
        }).catch((e) => console.error("Agency email dispatch error:", e));
      } catch (mailErr) {
        console.error("Mail error:", mailErr);
      }

      return NextResponse.json({
        success: true,
        mode: "request_submitted",
        message: "Votre demande de modification a été transmise à notre service de réservation. L'agence va l'examiner et vous confirmer l'acceptation sous peu.",
        booking,
      });
    }

    return NextResponse.json({ success: false, error: "Action non permise" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/bookings/[id]/modify error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la modification de la réservation.",
      },
      { status: 500 }
    );
  }
}

