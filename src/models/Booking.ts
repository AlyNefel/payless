import mongoose, { Schema, Document, Model } from "mongoose";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "awaiting_payment"
  | "paid"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded" | "failed";

export interface IPricingBreakdown {
  dailyRate: number;
  rentalDays: number;
  subtotal: number;
  extrasTotal: number;
  discountAmount: number;
  taxAmount: number;
  taxRate: number;
  timbreFiscal?: number;
  contributionLF2026?: number;
  outOfTownFee?: number;
  pickupLocationFee?: number;
  returnLocationFee?: number;
  differentLocationFee?: number;
  depositAmount: number;
  totalAmount: number;
  currency: string;
}

export interface IBookingExtra {
  extraId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IBookingAudit {
  action: string;
  performedBy: mongoose.Types.ObjectId | string;
  performedByRole: string;
  previousValue?: unknown;
  newValue?: unknown;
  timestamp: Date;
  notes?: string;
}

export interface IModificationRequest {
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  pickupDate?: Date;
  returnDate?: Date;
  pickupTime?: string;
  returnTime?: string;
  pickupLocationId?: mongoose.Types.ObjectId;
  returnLocationId?: mongoose.Types.ObjectId;
  customerNotes?: string;
  reason?: string;
  decisionNotes?: string;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingReference: string;
  customerId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  pickupLocationId: mongoose.Types.ObjectId;
  returnLocationId: mongoose.Types.ObjectId;
  pickupDate: Date;
  returnDate: Date;
  rentalDuration: number; // days
  pricingBreakdown: IPricingBreakdown;
  extras: IBookingExtra[];
  couponCode?: string;
  promotionId?: mongoose.Types.ObjectId;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: "cash" | "bank_transfer" | "credit_card" | string;
  customerLanguage: "fr" | "en" | "ar";
  internalNotes: string;
  customerNotes?: string;
  auditHistory: IBookingAudit[];
  modificationRequest?: IModificationRequest;
  pickupRecordedAt?: Date;
  returnRecordedAt?: Date;
  cancellationReason?: string;
  rejectionReason?: string;
  isManualBooking: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    pickupLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    returnLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    pickupDate: { type: Date, required: true, index: true },
    returnDate: { type: Date, required: true, index: true },
    rentalDuration: { type: Number, required: true },
    pricingBreakdown: {
      dailyRate: { type: Number, required: true },
      rentalDays: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      extrasTotal: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      taxRate: { type: Number, default: 0 },
      timbreFiscal: { type: Number, default: 100 },
      contributionLF2026: { type: Number, default: 0 },
      outOfTownFee: { type: Number, default: 0 },
      pickupLocationFee: { type: Number, default: 0 },
      returnLocationFee: { type: Number, default: 0 },
      differentLocationFee: { type: Number, default: 0 },
      depositAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: "TND" },
    },
    extras: [
      {
        extraId: { type: Schema.Types.ObjectId, ref: "Extra" },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
      },
    ],
    couponCode: String,
    promotionId: { type: Schema.Types.ObjectId, ref: "Promotion" },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "awaiting_payment", "paid", "active", "completed", "cancelled", "rejected"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded", "failed"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      default: "cash",
    },
    customerLanguage: {
      type: String,
      enum: ["fr", "en", "ar"],
      default: "fr",
    },
    internalNotes: { type: String, default: "" },
    customerNotes: String,
    auditHistory: [
      {
        action: { type: String, required: true },
        performedBy: Schema.Types.Mixed,
        performedByRole: String,
        previousValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    modificationRequest: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
      },
      requestedAt: { type: Date, default: Date.now },
      processedAt: Date,
      processedBy: String,
      pickupDate: Date,
      returnDate: Date,
      pickupTime: String,
      returnTime: String,
      pickupLocationId: { type: Schema.Types.ObjectId, ref: "Location" },
      returnLocationId: { type: Schema.Types.ObjectId, ref: "Location" },
      customerNotes: String,
      reason: String,
      decisionNotes: String,
    },
    pickupRecordedAt: Date,
    returnRecordedAt: Date,
    cancellationReason: String,
    rejectionReason: String,
    isManualBooking: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

BookingSchema.index({ pickupDate: 1, returnDate: 1, vehicleId: 1 });
BookingSchema.index({ customerId: 1, createdAt: -1 });
BookingSchema.index({ bookingStatus: 1, pickupDate: 1 });

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
