import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Vehicle, VehicleCategory } from "@/models";
import { getFleetStockMap, getUnavailableVehicleIds } from "@/lib/availability";
import { sanitizeVehicleForClient } from "@/lib/sanitize";
import { sanitizeQuery } from "@/lib/utils";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Check if requester is authenticated admin
    let isAdmin = false;
    try {
      const session = await auth();
      const role = (session?.user as any)?.role?.toLowerCase();
      isAdmin = Boolean(role && ["admin", "superadmin", "manager", "agent"].includes(role));
    } catch {}

    const vehicleId = searchParams.get("vehicleId") || searchParams.get("id");
    if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) {
      const singleVehicle = await Vehicle.findById(vehicleId)
        .populate("categoryId")
        .populate("location")
        .lean();
      if (!singleVehicle) {
        return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
      }
      const finalDoc = isAdmin ? singleVehicle : sanitizeVehicleForClient(singleVehicle);
      return NextResponse.json({
        success: true,
        vehicle: finalDoc,
        vehicles: [finalDoc],
        data: [finalDoc],
        total: 1,
      });
    }

    const categoryParam = searchParams.get("category");
    const transmission = searchParams.get("transmission");
    const fuelType = searchParams.get("fuelType");
    const seats = searchParams.get("seats");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const pickupDate = searchParams.get("pickupDate");
    const returnDate = searchParams.get("returnDate");
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "price_asc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const query: Record<string, unknown> = {
      isActive: true,
    };

    // Filter by vehicle status
    // Admin can filter by any status (maintenance, rented, etc.);
    // For clients, all non-archived vehicles are shown (availability is strictly time-based)
    if (isAdmin && status) {
      query.status = status;
    } else {
      query.status = { $ne: "archived" };
    }

    // Filter by Category: accepts Category ID or Category Slug
    if (categoryParam) {
      if (mongoose.Types.ObjectId.isValid(categoryParam)) {
        query.categoryId = new mongoose.Types.ObjectId(categoryParam);
      } else {
        const categoryDoc = await VehicleCategory.findOne({
          slug: categoryParam.toLowerCase().trim(),
        }).lean();
        if (categoryDoc) {
          query.categoryId = categoryDoc._id;
        } else {
          return NextResponse.json(
            {
              success: true,
              data: [],
              pagination: { total: 0, page, limit, totalPages: 0 },
            },
            { status: 200 }
          );
        }
      }
    }

    // Filter by Transmission
    if (transmission && ["automatic", "manual"].includes(transmission.toLowerCase())) {
      query.transmission = transmission.toLowerCase();
    }

    // Filter by Fuel Type
    if (
      fuelType &&
      ["gasoline", "diesel", "electric", "hybrid"].includes(fuelType.toLowerCase())
    ) {
      query.fuelType = fuelType.toLowerCase();
    }

    // Filter by Seats (minimum seats)
    if (seats) {
      const seatsCount = parseInt(seats, 10);
      if (!isNaN(seatsCount) && seatsCount > 0) {
        query.seats = { $gte: seatsCount };
      }
    }

    // Filter by Location — ADMIN ONLY
    // Clients see ALL vehicles regardless of their physical garage/branch location.
    // The fleet is treated as a single unified pool (e.g. car in Sfax is visible for Tunis search).
    if (location && mongoose.Types.ObjectId.isValid(location) && isAdmin) {
      query.location = new mongoose.Types.ObjectId(location);
    }

    // Filter by Price range (TND / minor units resilient)
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) {
        const minVal = parseFloat(minPrice);
        if (!isNaN(minVal) && minVal >= 0) {
          priceFilter.$gte = minVal < 10000 ? Math.round(minVal * 100) : minVal;
        }
      }
      if (maxPrice) {
        const maxVal = parseFloat(maxPrice);
        if (!isNaN(maxVal) && maxVal > 0) {
          priceFilter.$lte = maxVal < 10000 ? Math.round(maxVal * 100) : maxVal;
        }
      }
      if (Object.keys(priceFilter).length > 0) {
        query["pricing.daily"] = priceFilter;
      }
    }

    // Text search on brand and model
    if (search && search.trim().length > 0) {
      const cleanSearch = sanitizeQuery(search.trim());
      const regex = new RegExp(cleanSearch, "i");
      query.$or = [{ brand: regex }, { model: regex }];
    }

    // Real-time fleet stock availability mapping
    let fleetStockMap: Record<string, { totalUnits: number; bookedUnits: number; availableUnits: number; isAvailable: boolean }> = {};
    const hasDateWindow = Boolean(pickupDate && returnDate);

    if (hasDateWindow) {
      const pDate = new Date(pickupDate as string);
      const rDate = new Date(returnDate as string);

      if (!isNaN(pDate.getTime()) && !isNaN(rDate.getTime()) && rDate > pDate) {
        fleetStockMap = await getFleetStockMap(pDate, rDate);
        // Exclude vehicles that have 0 units available during this date window
        const unavailableIds = Object.keys(fleetStockMap).filter((id) => !fleetStockMap[id].isAvailable);
        if (unavailableIds.length > 0) {
          const unavailableObjectIds = unavailableIds
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id));

          query._id = { $nin: unavailableObjectIds };
        }
      }
    }

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { "pricing.daily": 1 };
    switch (sort) {
      case "price_desc":
        sortOptions = { "pricing.daily": -1 };
        break;
      case "price_asc":
        sortOptions = { "pricing.daily": 1 };
        break;
      case "newest":
        sortOptions = { year: -1, createdAt: -1 };
        break;
      case "seats_desc":
        sortOptions = { seats: -1 };
        break;
      default:
        sortOptions = { "pricing.daily": 1 };
    }

    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate("categoryId")
        .populate("location")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Vehicle.countDocuments(query),
    ]);

    // Format & Enrich with stock counters, and sanitize for non-admin
    const processedVehicles = vehicles.map((v: any) => {
      const vId = v._id.toString();
      const stock = fleetStockMap[vId] || {
        totalUnits: Math.max(1, v.totalUnits || 3),
        bookedUnits: 0,
        availableUnits: Math.max(1, v.availableUnits || v.totalUnits || 3),
        isAvailable: v.status === "available",
      };

      const enriched = {
        ...v,
        totalUnits: stock.totalUnits,
        availableUnits: stock.availableUnits,
        bookedUnits: stock.bookedUnits,
        isAvailable: stock.isAvailable,
      };

      return isAdmin ? enriched : sanitizeVehicleForClient(enriched);
    });

    return NextResponse.json(
      {
        success: true,
        data: processedVehicles,
        vehicles: processedVehicles,
        total,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch vehicles",
      },
      { status: 500 }
    );
  }
}
