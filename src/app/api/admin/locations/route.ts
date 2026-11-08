import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Location from "@/models/Location";
import mongoose from "mongoose";

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

export async function GET() {
  try {
    await connectDB();
    const locations = await Location.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, locations });
  } catch (error) {
    console.error("GET /api/admin/locations error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();

    const nameFr = body.name?.fr || (typeof body.name === "string" ? body.name : "Nouvelle Agence");
    const nameEn = body.name?.en || nameFr;
    const nameAr = body.name?.ar || nameFr;

    const newLocation = await Location.create({
      name: { fr: nameFr, en: nameEn, ar: nameAr },
      address: body.address || "Tunisie",
      city: body.city || "Tunis",
      country: body.country || "Tunisie",
      phone: body.phone || "+216 25 120 130",
      email: body.email || "contact@paylesscarrental.tn",
      isAirport: Boolean(body.isAirport),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      isOutsideTunis: Boolean(body.isOutsideTunis),
      customReturnFee: Number(body.customReturnFee || 0),
    });

    return NextResponse.json({ success: true, location: newLocation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/locations error:", error);
    return NextResponse.json({ success: false, error: "Failed to create location" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: "ID and updates required" }, { status: 400 });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Location.findByIdAndUpdate(id, { $set: updates }, { new: true });
      return NextResponse.json({ success: true, location: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid location ID" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/admin/locations error:", error);
    return NextResponse.json({ success: false, error: "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Valid location ID required" }, { status: 400 });
    }

    await Location.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Location deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/locations error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete location" }, { status: 500 });
  }
}

