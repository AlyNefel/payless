import connectDB from "./db";
import Booking from "@/models/Booking";
import type { BookingStatus } from "@/models/Booking";

const ACTIVE_STATUSES: BookingStatus[] = [
  "confirmed",
  "awaiting_payment",
  "paid",
  "active",
];

/**
 * Check if a vehicle is available for a given date range
 * This is the authoritative server-side availability check.
 * Never trust client-side availability.
 */
export async function checkVehicleAvailability(
  vehicleId: string,
  pickupDate: Date,
  returnDate: Date,
  excludeBookingId?: string
): Promise<boolean> {
  await connectDB();

  const query: {
    vehicleId: string;
    bookingStatus: { $in: BookingStatus[] };
    $or: { pickupDate: { $lt: Date }; returnDate: { $gt: Date } }[];
    _id?: { $ne: string };
  } = {
    vehicleId,
    bookingStatus: { $in: ACTIVE_STATUSES },
    $or: [
      {
        pickupDate: { $lt: returnDate },
        returnDate: { $gt: pickupDate },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query).lean();
  return !conflictingBooking;
}

/**
 * Get available vehicles for a date range
 */
export async function getAvailableVehicleIds(
  pickupDate: Date,
  returnDate: Date
): Promise<string[]> {
  await connectDB();

  const conflictingBookings = await Booking.find({
    bookingStatus: { $in: ACTIVE_STATUSES },
    pickupDate: { $lt: returnDate },
    returnDate: { $gt: pickupDate },
  })
    .select("vehicleId")
    .lean();

  return conflictingBookings.map((b) => b.vehicleId.toString());
}

/**
 * Get a vehicle's booked date ranges
 */
export async function getVehicleBookedDates(vehicleId: string): Promise<
  { start: Date; end: Date; status: string }[]
> {
  await connectDB();

  const bookings = await Booking.find({
    vehicleId,
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
