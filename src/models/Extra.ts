import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExtra extends Document {
  _id: mongoose.Types.ObjectId;
  name: { fr: string; en: string; ar: string };
  description: { fr: string; en: string; ar: string };
  icon: string;
  price: number; // per day in minor units
  pricingType: "per_day" | "per_rental" | "per_unit";
  maxQuantity: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExtraSchema = new Schema<IExtra>(
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
    icon: { type: String, required: true },
    price: { type: Number, required: true },
    pricingType: {
      type: String,
      enum: ["per_day", "per_rental", "per_unit"],
      default: "per_day",
    },
    maxQuantity: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Extra: Model<IExtra> =
  mongoose.models.Extra || mongoose.model<IExtra>("Extra", ExtraSchema);

export default Extra;
