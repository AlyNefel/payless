import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Vehicle, VehicleCategory } from "@/models";
import { getAvailableVehicleIds } from "@/lib/availability";
import { sanitizeQuery } from "@/lib/utils";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const vehicleId = searchParams.get("vehicleId") || searchParams.get("id");
    if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) {
      const singleVehicle = await Vehicle.findById(vehicleId)
        .populate("categoryId")
        .populate("location")
        .lean();
      if (!singleVehicle) {
        return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        vehicle: singleVehicle,
        vehicles: [singleVehicle],
        data: [singleVehicle],
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

    // Filter by vehicle status (default: available)
    if (status) {
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
          // Non-existent category returns empty set
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

    // Filter by Location
    if (location && mongoose.Types.ObjectId.isValid(location)) {
      query.location = new mongoose.Types.ObjectId(location);
    }

    // Filter by Price range (TND / minor units resilient)
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) {
        const minVal = parseFloat(minPrice);
        if (!isNaN(minVal) && minVal >= 0) {
          // If < 10000, consider input as TND major units, convert to minor units
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

    // Filter by Date window availability
    if (pickupDate && returnDate) {
      const pDate = new Date(pickupDate);
      const rDate = new Date(returnDate);

      if (!isNaN(pDate.getTime()) && !isNaN(rDate.getTime()) && rDate > pDate) {
        // getAvailableVehicleIds returns IDs of conflicting bookings during this window
        const conflictingVehicleIds = await getAvailableVehicleIds(pDate, rDate);
        if (conflictingVehicleIds.length > 0) {
          const conflictingObjectIds = conflictingVehicleIds
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id));

          query._id = { $nin: conflictingObjectIds };
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

    return NextResponse.json(
      {
        success: true,
        data: vehicles,
        vehicles: vehicles,
        total,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
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
