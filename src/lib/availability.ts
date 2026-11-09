import connectDB from "./db";
import Booking from "@/models/Booking";
import Vehicle from "@/models/Vehicle";
import type { BookingStatus } from "@/models/Booking";
import mongoose from "mongoose";

export const ACTIVE_STATUSES: BookingStatus[] = [
  "confirmed",
  "awaiting_payment",
  "paid",
  "active",
];

export interface VehicleStockInfo {
  totalUnits: number;
  bookedUnits: number;
  availableUnits: number;
  isAvailable: boolean;
}

/**
 * Check real-time vehicle availability based on actual physical fleet stock
 * and currently confirmed/active bookings for the requested date window.
 */
export async function getVehicleStockAvailability(
  vehicleId: string,
  pickupDate: Date,
  returnDate: Date,
  excludeBookingId?: string
): Promise<VehicleStockInfo> {
  await connectDB();

  const vehicle = await Vehicle.findById(vehicleId).select("totalUnits availableUnits status isActive").lean();
  if (!vehicle || !vehicle.isActive || vehicle.status === "archived" || vehicle.status === "maintenance" || vehicle.status === "unavailable") {
    return { totalUnits: 0, bookedUnits: 0, availableUnits: 0, isAvailable: false };
  }

  const totalUnits = Math.max(1, vehicle.totalUnits || 3);

  const query: Record<string, unknown> = {
    vehicleId: new mongoose.Types.ObjectId(vehicleId),
    bookingStatus: { $in: ACTIVE_STATUSES },
    pickupDate: { $lt: returnDate },
    returnDate: { $gt: pickupDate },
  };

  if (excludeBookingId && mongoose.Types.ObjectId.isValid(excludeBookingId)) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
  }

  const bookedUnits = await Booking.countDocuments(query);
  const availableUnits = Math.max(0, totalUnits - bookedUnits);

  return {
    totalUnits,
    bookedUnits,
    availableUnits,
    isAvailable: availableUnits > 0,
  };
}

/**
 * Boolean availability check for strict validation
 */
export async function checkVehicleAvailability(
  vehicleId: string,
  pickupDate: Date,
  returnDate: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const stock = await getVehicleStockAvailability(vehicleId, pickupDate, returnDate, excludeBookingId);
  return stock.isAvailable;
}

/**
 * Aggregates all bookings and returns a map of stock availability for all vehicles in a date window
 */
export async function getFleetStockMap(
  pickupDate: Date,
  returnDate: Date
): Promise<Record<string, VehicleStockInfo>> {
  await connectDB();

  // 1. Fetch all active vehicles with their totalUnits
  const vehicles = await Vehicle.find({
    isActive: true,
    status: { $nin: ["archived", "maintenance", "unavailable"] },
  })
    .select("_id totalUnits")
    .lean();

  // 2. Aggregate active bookings overlapping requested window
  const bookingAgg = await Booking.aggregate([
    {
      $match: {
        bookingStatus: { $in: ACTIVE_STATUSES },
        pickupDate: { $lt: returnDate },
        returnDate: { $gt: pickupDate },
      },
    },
    {
      $group: {
        _id: "$vehicleId",
        bookedCount: { $sum: 1 },
      },
    },
  ]);

  const bookedMap = new Map<string, number>();
  bookingAgg.forEach((b) => {
    bookedMap.set(b._id.toString(), b.bookedCount);
  });

  const result: Record<string, VehicleStockInfo> = {};

  vehicles.forEach((v) => {
    const vId = v._id.toString();
    const totalUnits = Math.max(1, v.totalUnits || 3);
    const bookedUnits = bookedMap.get(vId) || 0;
    const availableUnits = Math.max(0, totalUnits - bookedUnits);

    result[vId] = {
      totalUnits,
      bookedUnits,
      availableUnits,
      isAvailable: availableUnits > 0,
    };
  });

  return result;
}

/**
 * Returns IDs of vehicles that have NO available units left for the requested window
 */
export async function getUnavailableVehicleIds(
  pickupDate: Date,
  returnDate: Date
): Promise<string[]> {
  const stockMap = await getFleetStockMap(pickupDate, returnDate);
  return Object.keys(stockMap).filter((vId) => !stockMap[vId].isAvailable);
}

/**
 * Backwards compatibility helper
 */
export async function getAvailableVehicleIds(
  pickupDate: Date,
  returnDate: Date
): Promise<string[]> {
  return getUnavailableVehicleIds(pickupDate, returnDate);
}

/**
 * Get a vehicle's booked date ranges for calendar display
 */
export async function getVehicleBookedDates(vehicleId: string): Promise<
  { start: Date; end: Date; status: string }[]
> {
  await connectDB();

  const bookings = await Booking.find({
    vehicleId: new mongoose.Types.ObjectId(vehicleId),
    bookingStatus: { $in: ACTIVE_STATUSES },
    returnDate: { $gte: new Date() },
  })
    .select("pickupDate returnDate bookingStatus")
    .lean();

  return bookings.map((b) => ({
    start: b.pickupDate,
    end: b.returnDate,
    status: b.bookingStatus,
  }));
}
