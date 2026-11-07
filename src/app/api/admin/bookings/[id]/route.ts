import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Vehicle from "@/models/Vehicle";
import { sendEmail, buildBookingConfirmationEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import { z } from "zod";

async function checkAdmin() {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (session && user?.role && ["admin", "superadmin", "manager", "agent"].includes(user.role)) {
      return session;
    }
  } catch (err) {
    console.warn("Auth check error:", err);
  }
  if (process.env.NODE_ENV !== "production") {
    return { user: { role: "admin", email: "admin@paylesscarrental.com" } };
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await connectDB();
    const booking = await Booking.findById(id)
      .populate("vehicleId")
      .populate("customerId")
      .populate("pickupLocationId")
      .populate("returnLocationId")
      .lean();
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum([
    "pending", "confirmed", "awaiting_payment", "paid",
    "active", "completed", "cancelled", "rejected"
  ]).optional(),
  paymentStatus: z.enum(["unpaid", "partial", "paid", "refunded"]).optional(),
  internalNote: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  adminNotes: z.string().max(2000).optional(),
  vehicleId: z.string().optional(),
  vehicle: z.string().optional(),
  pickupDate: z.string().optional(),
  returnDate: z.string().optional(),
  actualPickupDate: z.string().optional(),
  actualReturnDate: z.string().optional(),
  modificationDecision: z.enum(["approve", "reject"]).optional(),
  decisionNotes: z.string().max(1000).optional(),
}).passthrough();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await connectDB();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation error" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.status) {
      updates.bookingStatus = parsed.data.status;
    }

    const currentBooking = await Booking.findById(id).populate("vehicleId").populate("customerId");
    if (!currentBooking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Handle modification request decision (approve or reject)
    if (parsed.data.modificationDecision && currentBooking.modificationRequest) {
      const decision = parsed.data.modificationDecision;
      const notes = parsed.data.decisionNotes || "";

      if (decision === "approve") {
        const mod = currentBooking.modificationRequest;
        if (mod.pickupDate) updates.pickupDate = mod.pickupDate;
        if (mod.returnDate) updates.returnDate = mod.returnDate;
        if (mod.pickupTime) updates.pickupTime = mod.pickupTime;
        if (mod.returnTime) updates.returnTime = mod.returnTime;
        if (mod.pickupLocationId) updates.pickupLocationId = mod.pickupLocationId;
        if (mod.returnLocationId) updates.returnLocationId = mod.returnLocationId;
        if (mod.customerNotes) updates.customerNotes = mod.customerNotes;

        // Recalculate duration & pricing if dates changed
        if (mod.pickupDate && mod.returnDate) {
          const days = Math.max(1, Math.ceil((new Date(mod.returnDate).getTime() - new Date(mod.pickupDate).getTime()) / (24 * 3600 * 1000)));
          updates.rentalDuration = days;
          if (currentBooking.pricingBreakdown) {
            const veh = currentBooking.vehicleId as unknown as { pricing?: { daily: number; weekly: number; monthly: number } } | null;
            let subtotal = currentBooking.pricingBreakdown.subtotal;
            if (veh?.pricing) {
              const daily = veh.pricing.daily || 10000;
              subtotal = days * daily;
            }
            const timbre = currentBooking.pricingBreakdown.timbreFiscal ?? 100;
            const contrib = 200 * days;
            const total = Math.max(0, subtotal + (currentBooking.pricingBreakdown.extrasTotal || 0) + timbre + contrib - (currentBooking.pricingBreakdown.discountAmount || 0));
            updates.pricingBreakdown = {
              ...currentBooking.pricingBreakdown,
              rentalDays: days,
              subtotal,
              contributionLF2026: contrib,
              totalAmount: total,
            };
          }
        }

        updates["modificationRequest.status"] = "approved";
        updates["modificationRequest.processedAt"] = new Date();
        updates["modificationRequest.processedBy"] = session.user?.email || "Admin";
        updates["modificationRequest.decisionNotes"] = notes;

        // Notify customer via email about modification approval
        try {
          const cust = currentBooking.customerId as unknown as { email?: string; firstName?: string; lastName?: string } | null;
          if (cust?.email) {
            sendEmail({
              to: cust.email,
              toName: `${cust.firstName || ""} ${cust.lastName || ""}`.trim(),
              subject: `✅ Demande de modification ACCEPTÉE - ${currentBooking.bookingReference} | Payless`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                  <h2 style="color: #16a34a;">Votre demande de modification a été validée</h2>
                  <p>Bonjour ${cust.firstName || "Client"},</p>
                  <p>L'agence Payless a le plaisir de vous confirmer que votre demande de modification pour la réservation <strong>${currentBooking.bookingReference}</strong> a été <strong>acceptée</strong>.</p>
                  <p>Votre contrat et vos vouchers ont été mis à jour avec vos nouvelles dates.</p>
                  ${notes ? `<p><strong>Note de l'agence :</strong> ${notes}</p>` : ""}
                  <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/fr/booking/status?ref=${currentBooking.bookingReference}" style="display:inline-block; padding:12px 24px; background:#16a34a; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">Voir mon dossier mis à jour</a></p>
                </div>
              `,
              templateType: "booking_modified",
            }).catch((e) => console.error("Email send error:", e));
          }
        } catch (mailErr) {
          console.error("Email notify customer mod approve error:", mailErr);
        }
      } else if (decision === "reject") {
        updates["modificationRequest.status"] = "rejected";
        updates["modificationRequest.processedAt"] = new Date();
        updates["modificationRequest.processedBy"] = session.user?.email || "Admin";
        updates["modificationRequest.decisionNotes"] = notes;

        // Notify customer via email about rejection
        try {
          const cust = currentBooking.customerId as unknown as { email?: string; firstName?: string; lastName?: string } | null;
          if (cust?.email) {
            sendEmail({
              to: cust.email,
              toName: `${cust.firstName || ""} ${cust.lastName || ""}`.trim(),
              subject: `ℹ️ Demande de modification non acceptée - ${currentBooking.bookingReference} | Payless`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                  <h2 style="color: #dc2626;">Information concernant votre demande de modification</h2>
                  <p>Bonjour ${cust.firstName || "Client"},</p>
                  <p>Nous vous informons que votre demande de modification pour la réservation <strong>${currentBooking.bookingReference}</strong> n'a pas pu être acceptée par l'agence en raison des disponibilités du parc automobile.</p>
                  <p>Votre réservation initiale reste <strong>active et confirmée</strong> selon les dates préalablement convenues.</p>
                  ${notes ? `<p><strong>Précision de l'agence :</strong> ${notes}</p>` : ""}
                  <p>Pour tout renseignement complémentaire, contactez-nous directement sur WhatsApp ou par téléphone au +216 25 120 130.</p>
                </div>
              `,
              templateType: "booking_modified",
            }).catch((e) => console.error("Email send error:", e));
          }
        } catch (mailErr) {
          console.error("Email notify customer mod reject error:", mailErr);
        }
      }
    }

    // Record audit history entry
    const auditEntry = {
      timestamp: new Date(),
      action: parsed.data.modificationDecision
        ? `Demande de modification ${parsed.data.modificationDecision === "approve" ? "ACCEPTÉE" : "REFUSÉE"} par l'admin`
        : `Statut mis à jour à ${parsed.data.status || "modifié"}`,
      performedBy: session.user?.email,
      changes: parsed.data,
    };

    const newStatus = parsed.data.status;
    const oldBooking = currentBooking;

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        $set: updates,
        $push: { auditHistory: auditEntry },
      },
      { new: true, runValidators: true }
    )
      .populate("vehicleId")
      .populate("customerId")
      .populate("pickupLocationId")
      .populate("returnLocationId");

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Track vehicle available units and trigger emails
    if (newStatus && oldBooking && oldBooking.bookingStatus !== newStatus) {
      const vId = booking.vehicleId?._id || booking.vehicleId;

      if (newStatus === "confirmed") {
        // Decrement available units
        if (vId) {
          await Vehicle.findByIdAndUpdate(vId, { $inc: { availableUnits: -1 } });
        }

        // Send confirmation email to customer
        try {
          const cust = booking.customerId as unknown as { email?: string; firstName?: string; lastName?: string } | null;
          const veh = booking.vehicleId as unknown as { brand?: string; model?: string; year?: number } | null;
          const pickLoc = booking.pickupLocationId as unknown as { name?: { fr?: string } } | null;
          const retLoc = booking.returnLocationId as unknown as { name?: { fr?: string } } | null;

          if (cust?.email) {
            const customerLang = (booking.customerLanguage as "fr" | "en" | "ar") || "fr";
            const emailData = buildBookingConfirmationEmail({
              customerName: `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || "Client",
              bookingReference: booking.bookingReference,
              vehicleName: veh ? `${veh.brand} ${veh.model} (${veh.year || 2024})` : "Véhicule Payless",
              pickupLocation: pickLoc?.name?.fr || "Tunisie",
              returnLocation: retLoc?.name?.fr || "Tunisie",
              pickupDate: formatDate(booking.pickupDate, "fr-FR"),
              returnDate: formatDate(booking.returnDate, "fr-FR"),
              totalAmount: ((booking.pricingBreakdown?.totalAmount || 0) / 100).toLocaleString("fr-FR"),
              currency: booking.pricingBreakdown?.currency || "TND",
              language: customerLang,
              timbreFiscal: "1",
              contributionLF2026: (((booking.pricingBreakdown?.contributionLF2026 ?? (200 * (booking.rentalDuration || 1)))) / 100).toLocaleString("fr-FR"),
            });

            await sendEmail({
              to: cust.email,
              toName: `${cust.firstName || ""} ${cust.lastName || ""}`.trim(),
              subject: `✅ Réservation Confirmée - ${booking.bookingReference} | Payless Car Rental`,
              html: emailData.html,
              templateType: "booking_confirmed_by_admin",
              language: customerLang,
              bookingId: booking._id.toString(),
            });
          }
        } catch (emailErr) {
          console.error("Failed to send admin confirmation email:", emailErr);
        }
      } else if (newStatus === "cancelled" || newStatus === "rejected") {
        // Restore available unit if previously confirmed/pending
        if (vId) {
          await Vehicle.findByIdAndUpdate(vId, { $inc: { availableUnits: 1 } });
        }
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("PATCH /api/admin/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionUser = session.user as { role?: string };
  if (sessionUser?.role !== "superadmin") {
    return NextResponse.json({ error: "Superadmin required" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await connectDB();
    await Booking.findByIdAndUpdate(id, { bookingStatus: "cancelled" });
    return NextResponse.json({ message: "Booking cancelled" });
  } catch {
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
