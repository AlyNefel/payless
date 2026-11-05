import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Vehicle } from "@/models";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all"; // all, alert, overdue, ok

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { licensePlate: { $regex: search, $options: "i" } },
      ];
    }

    const rawVehicles = await Vehicle.find(query)
      .populate("categoryId", "name code")
      .sort({ brand: 1, model: 1 })
      .lean();

    const enrichedVehicles = rawVehicles.map((v) => {
      const mileage = Number(v.mileage || 0);
      const lastVidange = Number(v.lastVidangeMileage || 0);
      const interval = Number(v.vidangeInterval || 10000);
      const nextVidange = Number(v.nextVidangeMileage || (lastVidange + interval));
      const remainingKm = nextVidange - mileage;
      const isOverdue = remainingKm <= 0;
      const isUrgent = remainingKm <= 2000; // Alert if 2,000 km or less before next vidange

      const kmSinceLast = Math.max(0, mileage - lastVidange);
      const percentUsed = Math.min(100, Math.max(0, Math.round((kmSinceLast / interval) * 100)));

      return {
        _id: v._id.toString(),
        brand: v.brand,
        model: v.model,
        year: v.year,
        licensePlate: v.licensePlate || "Non assignée",
        status: v.status || "available",
        images: v.images || [],
        transmission: v.transmission,
        fuelType: v.fuelType,
        mileage,
        lastVidangeMileage: lastVidange,
        nextVidangeMileage: nextVidange,
        vidangeInterval: interval,
        remainingKm,
        isUrgent,
        isOverdue,
        percentUsed,
        garageNotes: v.garageNotes || "",
        technicalInspectionDate: v.technicalInspectionDate || null,
        maintenanceNotes: v.maintenanceNotes || "",
        category: (v.categoryId as { name?: { fr?: string } })?.name?.fr || "Standard",
      };
    });

    // Overall stats
    const total = enrichedVehicles.length;
    const overdueCount = enrichedVehicles.filter((v) => v.isOverdue).length;
    const alertsCount = enrichedVehicles.filter((v) => v.isUrgent && !v.isOverdue).length;
    const okCount = enrichedVehicles.filter((v) => !v.isUrgent).length;

    // Apply alert/status filter if requested
    let filteredVehicles = enrichedVehicles;
    if (filter === "alert") {
      filteredVehicles = enrichedVehicles.filter((v) => v.isUrgent && !v.isOverdue);
    } else if (filter === "overdue") {
      filteredVehicles = enrichedVehicles.filter((v) => v.isOverdue);
    } else if (filter === "ok") {
      filteredVehicles = enrichedVehicles.filter((v) => !v.isUrgent);
    } else if (filter === "urgent") {
      filteredVehicles = enrichedVehicles.filter((v) => v.isUrgent);
    }

    return NextResponse.json({
      success: true,
      vehicles: filteredVehicles,
      stats: {
        total,
        alertsCount,
        overdueCount,
        totalNeedAttention: overdueCount + alertsCount,
        okCount,
      },
    });
  } catch (error) {
    console.error("Error fetching garage vehicles:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la récupération des données du garage.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      vehicleId,
      mileage,
      lastVidangeMileage,
      nextVidangeMileage,
      vidangeInterval,
      garageNotes,
      technicalInspectionDate,
      status,
    } = body;

    if (!vehicleId || !mongoose.Types.ObjectId.isValid(vehicleId)) {
      return NextResponse.json(
        { success: false, error: "Identifiant du véhicule invalide." },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (mileage !== undefined) updates.mileage = Number(mileage);
    if (lastVidangeMileage !== undefined) updates.lastVidangeMileage = Number(lastVidangeMileage);
    if (vidangeInterval !== undefined) updates.vidangeInterval = Number(vidangeInterval);
    if (nextVidangeMileage !== undefined) {
      updates.nextVidangeMileage = Number(nextVidangeMileage);
    } else if (lastVidangeMileage !== undefined) {
      // Auto-compute next vidange if last vidange updated
      const interval = vidangeInterval ? Number(vidangeInterval) : 10000;
      updates.nextVidangeMileage = Number(lastVidangeMileage) + interval;
    }

    if (garageNotes !== undefined) updates.garageNotes = String(garageNotes);
    if (technicalInspectionDate !== undefined) {
      updates.technicalInspectionDate = technicalInspectionDate ? new Date(technicalInspectionDate) : null;
    }
    if (status !== undefined) updates.status = status;

    const updated = await Vehicle.findByIdAndUpdate(vehicleId, updates, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Véhicule non trouvé." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Informations du véhicule mises à jour avec succès.",
      vehicle: updated,
    });
  } catch (error) {
    console.error("Error updating garage vehicle:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la mise à jour.",
      },
      { status: 500 }
    );
  }
}

