import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { sanitizeQuery } from "@/lib/utils";

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
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: Record<string, unknown> = {};
    if (search) {
      const q = sanitizeQuery(search);
      query.$or = [
        { brand: { $regex: q, $options: "i" } },
        { model: { $regex: q, $options: "i" } },
        { licensePlate: { $regex: q, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Vehicle.countDocuments(query),
    ]);

    return NextResponse.json({ vehicles, total, page, limit });
  } catch (error) {
    console.error("GET /api/admin/vehicles error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    
    // Flatten pricing from body
    const vehicleData = {
      ...body,
      pricing: {
        daily: body.pricingDaily || body["pricing.daily"] || body.pricing?.daily || 0,
        weekly: body.pricingWeekly || body["pricing.weekly"] || body.pricing?.weekly || 0,
        monthly: body.pricingMonthly || body["pricing.monthly"] || body.pricing?.monthly || 0,
        deposit: body.pricingDeposit || body["pricing.deposit"] || body.pricing?.deposit || 0,
      },
    };

    const vehicle = await Vehicle.create(vehicleData);
    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/vehicles error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Vehicle ID required" }, { status: 400 });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("PUT /api/admin/vehicles error:", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Vehicle ID required" }, { status: 400 });
    }

    // Soft delete — mark as unavailable
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { status: "unavailable", archivedAt: new Date() },
      { new: true }
    );

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Vehicle archived successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/vehicles error:", error);
    return NextResponse.json({ error: "Failed to archive vehicle" }, { status: 500 });
  }
}
