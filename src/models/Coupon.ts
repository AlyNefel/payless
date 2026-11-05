import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  promotionId?: mongoose.Types.ObjectId;
  type: "percentage" | "fixed";
  value: number;
  minimumDays?: number;
  minimumAmount?: number;
  usageLimit?: number;
  usageCount: number;
  applicableCategories: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  usedBy: { customerId: mongoose.Types.ObjectId; bookingId: mongoose.Types.ObjectId; usedAt: Date }[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    promotionId: { type: Schema.Types.ObjectId, ref: "Promotion" },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minimumDays: Number,
    minimumAmount: Number,
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "VehicleCategory" }],
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    usedBy: [
      {
        customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
        bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
