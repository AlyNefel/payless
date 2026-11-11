import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Vehicle from "@/models/Vehicle";

async function checkAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || !user?.role || !["admin", "superadmin", "manager"].includes(user.role)) {
    return null;
  }
  return session;
}

export async function GET(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const vehicles = await Vehicle.find({})
      .select("brand model licensePlate category images pricing status")
      .sort({ brand: 1, model: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      vehicles: vehicles.map((v: any) => ({
        _id: v._id.toString(),
        brand: v.brand,
        model: v.model,
        licensePlate: v.licensePlate || "TUN-2026",
        category: v.category || "Berline",
        imageUrl: v.images?.find((img: any) => img.isPrimary)?.url || v.images?.[0]?.url || "",
        status: v.status || "available",
        pricing: {
          daily: v.pricing?.daily >= 1000 ? Math.round(v.pricing.daily / 100) : v.pricing?.daily || 0,
          weekly: v.pricing?.weekly >= 1000 ? Math.round(v.pricing.weekly / 100) : v.pricing?.weekly || 0,
          monthly: v.pricing?.monthly >= 1000 ? Math.round(v.pricing.monthly / 100) : v.pricing?.monthly || 0,
          deposit: v.pricing?.deposit >= 1000 ? Math.round(v.pricing.deposit / 100) : v.pricing?.deposit || 0,
          seasonalPrices: (v.pricing?.seasonalPrices || []).map((s: any) => ({
            name: s.name || "",
            startMonth: s.startMonth,
            endMonth: s.endMonth,
            startDate: s.startDate || "",
            endDate: s.endDate || "",
            dailyRate: s.dailyRate >= 1000 ? Math.round(s.dailyRate / 100) : s.dailyRate,
            discountPercent: s.discountPercent || 0,
          })),
        },
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/vehicles/pricing error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicle pricing" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { vehicleId, seasonalPrices, dailyRate } = body;

    if (!vehicleId) {
      return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Determine if base pricing is stored in cents/millimes (e.g. 9000 for 90 TND)
    const isCents = vehicle.pricing?.daily >= 1000;

    if (dailyRate !== undefined && dailyRate > 0) {
      vehicle.pricing.daily = isCents ? Number(dailyRate) * 100 : Number(dailyRate);
    }

    if (Array.isArray(seasonalPrices)) {
      vehicle.pricing.seasonalPrices = seasonalPrices.map((s: any) => ({
        name: s.name?.trim() || "Période personnalisée",
        startMonth: s.startMonth ? Number(s.startMonth) : undefined,
        endMonth: s.endMonth ? Number(s.endMonth) : undefined,
        startDate: s.startDate || "",
        endDate: s.endDate || "",
        dailyRate: isCents ? Number(s.dailyRate) * 100 : Number(s.dailyRate),
        discountPercent: Number(s.discountPercent || 0),
      }));
    }

    await vehicle.save();

    return NextResponse.json({
      success: true,
      message: "Tarifs mis à jour avec succès",
      vehicle: {
        _id: vehicle._id.toString(),
        brand: vehicle.brand,
        model: vehicle.model,
        pricing: vehicle.pricing,
      },
    });
  } catch (error) {
    console.error("PUT /api/admin/vehicles/pricing error:", error);
    return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 });
  }
}

