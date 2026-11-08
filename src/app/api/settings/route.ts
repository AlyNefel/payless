import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencySetting from "@/models/AgencySetting";

export async function GET() {
  try {
    await connectDB();
    const settings = await AgencySetting.find({}).lean();
    const formatted: Record<string, unknown> = {};
    settings.forEach((s) => {
      formatted[s.key] = s.value;
    });

    return NextResponse.json(
      {
        success: true,
        settings: formatted,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}
