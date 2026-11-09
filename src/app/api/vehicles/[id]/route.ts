import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Vehicle } from "@/models";
import { getVehicleStockAvailability } from "@/lib/availability";
import { sanitizeVehicleForClient } from "@/lib/sanitize";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid vehicle ID" }, { status: 400 });
    }

    const vehicle = await Vehicle.findById(id)
      .populate("categoryId")
      .populate("location")
      .lean();

    if (!vehicle) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
    }

    // Check optional dates in query for real-time stock availability
    const { searchParams } = new URL(request.url);
    const pickupDateStr = searchParams.get("pickupDate");
    const returnDateStr = searchParams.get("returnDate");

    let stockInfo = {
      totalUnits: Math.max(1, (vehicle as any).totalUnits || 3),
      bookedUnits: 0,
      availableUnits: Math.max(1, (vehicle as any).availableUnits || (vehicle as any).totalUnits || 3),
      isAvailable: (vehicle as any).status === "available",
    };

    if (pickupDateStr && returnDateStr) {
      const pDate = new Date(pickupDateStr);
      const rDate = new Date(returnDateStr);
      if (!isNaN(pDate.getTime()) && !isNaN(rDate.getTime()) && rDate > pDate) {
        stockInfo = await getVehicleStockAvailability(id, pDate, rDate);
      }
    }

    // Check admin status
    let isAdmin = false;
    try {
      const session = await auth();
      const role = (session?.user as any)?.role?.toLowerCase();
      isAdmin = Boolean(role && ["admin", "superadmin", "manager", "agent"].includes(role));
    } catch {}

    const enrichedVehicle = {
      ...vehicle,
      totalUnits: stockInfo.totalUnits,
      availableUnits: stockInfo.availableUnits,
      bookedUnits: stockInfo.bookedUnits,
      isAvailable: stockInfo.isAvailable,
    };

    const finalVehicle = isAdmin ? enrichedVehicle : sanitizeVehicleForClient(enrichedVehicle);

    return NextResponse.json({
      success: true,
      vehicle: finalVehicle,
      data: finalVehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle by id:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}
