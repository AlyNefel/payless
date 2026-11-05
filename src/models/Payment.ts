import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number; // minor units
  currency: string;
  method: "cash" | "card" | "bank_transfer" | "online" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  gatewayReference?: string;
  notes?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  recordedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "TND" },
    method: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "online", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String,
    gatewayReference: String,
    notes: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
