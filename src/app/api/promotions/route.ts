import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Promotion from "@/models/Promotion";

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("GET /api/promotions error:", error);
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

