import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Vehicle } from "@/models";
import mongoose from "mongoose";

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

    return NextResponse.json({
      success: true,
      vehicle,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle by id:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

