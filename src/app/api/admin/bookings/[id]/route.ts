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
      .populate("vehicle", "brand model licensePlate images pricing")
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
  adminNotes: z.string().max(2000).optional(),
  vehicle: z.string().optional(),
  pickupDate: z.string().optional(),
  returnDate: z.string().optional(),
  actualPickupDate: z.string().optional(),
  actualReturnDate: z.string().optional(),
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

    // Record audit history entry
    const auditEntry = {
      timestamp: new Date(),
      action: `Status updated to ${parsed.data.status || "modified"}`,
      performedBy: session.user?.email,
      changes: parsed.data,
    };

    const newStatus = parsed.data.status;
    const oldBooking = await Booking.findById(id);

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
    await Booking.findByIdAndUpdate(id, { status: "cancelled" });
    return NextResponse.json({ message: "Booking cancelled" });
  } catch {
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
