import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Database seed failed (GET):", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Database seed failed (POST):", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}
