import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVehicleCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: { fr: string; en: string; ar: string };
  slug: string;
  icon: string;
  description: { fr: string; en: string; ar: string };
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleCategorySchema = new Schema<IVehicleCategory>(
  {
    name: {
      fr: { type: String, required: true },
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, required: true },
    description: {
      fr: { type: String, default: "" },
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
    },
    image: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const VehicleCategory: Model<IVehicleCategory> =
  mongoose.models.VehicleCategory ||
  mongoose.model<IVehicleCategory>("VehicleCategory", VehicleCategorySchema);

export default VehicleCategory;
