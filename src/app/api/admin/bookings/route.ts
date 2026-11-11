import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Booking, Vehicle, Customer, Location } from "@/models";
import { sanitizeQuery } from "@/lib/utils";

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
  // Allow admin access in local development if session check is bypassed
  if (process.env.NODE_ENV !== "production") {
    return { user: { role: "admin", email: "admin@paylesscarrental.com" } };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    const query: Record<string, unknown> = {};

    if (status && status !== "All") {
      query.$or = [{ bookingStatus: status.toLowerCase() }, { status: status.toLowerCase() }];
    }

    if (search) {
      const q = sanitizeQuery(search);
      // Find matching customers first
      const matchedCustomers = await Customer.find({
        $or: [
          { firstName: { $regex: q, $options: "i" } },
          { lastName: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ],
      }).select("_id");
      const customerIds = matchedCustomers.map((c) => c._id);

      // Find matching vehicles
      const matchedVehicles = await Vehicle.find({
        $or: [
          { brand: { $regex: q, $options: "i" } },
          { model: { $regex: q, $options: "i" } },
          { licensePlate: { $regex: q, $options: "i" } },
        ],
      }).select("_id");
      const vehicleIds = matchedVehicles.map((v) => v._id);

      query.$or = [
        { bookingReference: { $regex: q, $options: "i" } },
        { customerId: { $in: customerIds } },
        { vehicleId: { $in: vehicleIds } },
      ];
    }

    if (fromDate || toDate) {
      const dateQuery: Record<string, Date> = {};
      if (fromDate) dateQuery.$gte = new Date(fromDate);
      if (toDate) dateQuery.$lte = new Date(toDate);
      query.pickupDate = dateQuery;
    }

    const [rawBookings, total] = await Promise.all([
      Booking.find(query)
        .populate("vehicleId")
        .populate("vehicles.vehicleId")
        .populate("customerId")
        .populate("pickupLocationId")
        .populate("returnLocationId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    // Format bookings with friendly normalized properties
    const bookings = rawBookings.map((b: any) => {
      const cust = b.customerId;
      const veh = b.vehicleId;
      const pLoc = b.pickupLocationId;
      const rLoc = b.returnLocationId;

      const multiVehName = b.vehicles?.length
        ? b.vehicles
            .map((v: any) => `${v.brand || v.vehicleId?.brand || ""} ${v.model || v.vehicleId?.model || ""}`.trim())
            .filter(Boolean)
            .join(" + ")
        : "";

      return {
        id: b._id.toString(),
        _id: b._id.toString(),
        reference: b.bookingReference,
        bookingReference: b.bookingReference,
        status: b.bookingStatus || "pending",
        bookingStatus: b.bookingStatus || "pending",
        paymentStatus: b.paymentStatus || "unpaid",
        customerName: cust ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim() : "Client Payless",
        customerPhone: cust?.phone || "",
        customerEmail: cust?.email || "",
        vehicles: b.vehicles || [],
        vehicleId: veh?._id?.toString() || (typeof b.vehicleId === "string" ? b.vehicleId : ""),
        vehicleName: multiVehName || (veh ? `${veh.brand} ${veh.model}` : "Véhicule"),
        licensePlate: veh?.licensePlate || "TUN-2026",
        vehicleImage: veh?.images?.find((i: any) => i.isPrimary)?.url || veh?.images?.[0]?.url || "",
        pickupDate: b.pickupDate ? new Date(b.pickupDate).toISOString().split("T")[0] : "",
        returnDate: b.returnDate ? new Date(b.returnDate).toISOString().split("T")[0] : "",
        rentalDuration: b.rentalDuration || 1,
        pickupLocation: pLoc?.name?.fr || pLoc?.name?.en || pLoc?.city || "Aéroport Tunis-Carthage",
        returnLocation: rLoc?.name?.fr || rLoc?.name?.en || rLoc?.city || "Aéroport Tunis-Carthage",
        totalAmount: b.pricingBreakdown?.totalAmount || 0,
        currency: b.pricingBreakdown?.currency || "TND",
        dailyRate: b.pricingBreakdown?.dailyRate || 0,
        timbreFiscal: b.pricingBreakdown?.timbreFiscal ?? 100,
        contributionLF2026: b.pricingBreakdown?.contributionLF2026 ?? (200 * (b.rentalDuration || 1)),
        outOfTownFee: b.pricingBreakdown?.outOfTownFee || 0,
        depositAmount: b.pricingBreakdown?.depositAmount || 0,
        extras: b.extras || [],
        customerLanguage: b.customerLanguage || "fr",
        createdAt: b.createdAt,
      };
    });

    return NextResponse.json({ success: true, bookings, total, page, limit });
  } catch (error) {
    console.error("GET /api/admin/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // If vehicle was assigned and booking was active/confirmed, restore vehicle availability
    if (["confirmed", "active", "pending"].includes(booking.bookingStatus)) {
      if (booking.vehicles && booking.vehicles.length > 0) {
        for (const item of booking.vehicles) {
          const vId = item.vehicleId;
          if (vId) {
            await Vehicle.findByIdAndUpdate(vId, {
              $inc: { availableUnits: 1 },
            }).catch(() => {});
          }
        }
      } else if (booking.vehicleId) {
        await Vehicle.findByIdAndUpdate(booking.vehicleId, {
          $inc: { availableUnits: 1 },
        }).catch(() => {});
      }
    }

    await Booking.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Réservation ${booking.bookingReference || id} supprimée définitivement avec succès.`,
    });
  } catch (error) {
    console.error("DELETE /api/admin/bookings error:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
