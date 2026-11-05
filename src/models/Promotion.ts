import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPromotion extends Document {
  _id: mongoose.Types.ObjectId;
  name: { fr: string; en: string; ar: string };
  description: { fr: string; en: string; ar: string };
  type: "percentage" | "fixed";
  value: number; // percentage (0-100) or fixed amount in minor units
  minimumDays?: number;
  applicableCategories: mongoose.Types.ObjectId[];
  applicableVehicles: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  image?: string;
  priority: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    name: {
      fr: { type: String, required: true },
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: {
      fr: { type: String, default: "" },
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
    },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minimumDays: Number,
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "VehicleCategory" }],
    applicableVehicles: [{ type: Schema.Types.ObjectId, ref: "Vehicle" }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    image: String,
    priority: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PromotionSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

const Promotion: Model<IPromotion> =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", PromotionSchema);

export default Promotion;
