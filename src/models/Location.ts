import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  name: { fr: string; en: string; ar: string };
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  coordinates?: { lat: number; lng: number };
  openingHours?: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  isAirport: boolean;
  isActive: boolean;
  isOutsideTunis?: boolean;
  customReturnFee?: number; // fee in minor units (e.g. 10000 = 100 DT)
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: {
      fr: { type: String, required: true },
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
    email: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    openingHours: {
      monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
    },
    isAirport: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isOutsideTunis: { type: Boolean, default: false },
    customReturnFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Location: Model<ILocation> =
  mongoose.models.Location ||
  mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
