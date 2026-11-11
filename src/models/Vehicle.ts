import mongoose, { Schema, Document, Model } from "mongoose";

export type TransmissionType = "automatic" | "manual";
export type FuelType = "gasoline" | "diesel" | "electric" | "hybrid";
export type VehicleStatus = "available" | "rented" | "maintenance" | "unavailable" | "archived";

export interface ISeasonalPrice {
  name?: string;
  startDate?: string;
  endDate?: string;
  startMonth?: number; // 1 to 12
  endMonth?: number;   // 1 to 12
  dailyRate: number;   // in DT or cents
  discountPercent?: number; // optional discount applied during this period
}

export interface IVehicle {
  _id: mongoose.Types.ObjectId;
  brand: string;
  model: string;
  year: number;
  categoryId: mongoose.Types.ObjectId;
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  doors: number;
  luggageCapacity: number;
  color: string;
  licensePlate: string;
  vin?: string;
  images: { url: string; publicId: string; isPrimary: boolean }[];
  status: VehicleStatus;
  pricing: {
    daily: number; // in minor units
    weekly: number;
    monthly: number;
    currency: string;
    deposit: number;
    seasonalPrices?: ISeasonalPrice[];
  };
  features: string[];
  hasAirConditioning: boolean;
  hasGPS: boolean;
  hasBluetooth: boolean;
  hasUSB: boolean;
  description: { fr: string; en: string; ar: string };
  maintenanceNotes?: string;
  garageNotes?: string;
  nextMaintenanceDate?: Date;
  mileage?: number;
  lastVidangeMileage?: number;
  nextVidangeMileage?: number;
  vidangeInterval?: number;
  technicalInspectionDate?: Date;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
  };
  location?: mongoose.Types.ObjectId;
  totalUnits?: number;
  availableUnits?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "VehicleCategory", required: true, index: true },
    transmission: { type: String, enum: ["automatic", "manual"], required: true },
    fuelType: { type: String, enum: ["gasoline", "diesel", "electric", "hybrid"], required: true },
    seats: { type: Number, required: true },
    doors: { type: Number, default: 4 },
    luggageCapacity: { type: Number, default: 2 },
    color: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true, uppercase: true },
    vin: String,
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ["available", "rented", "maintenance", "unavailable", "archived"],
      default: "available",
      index: true,
    },
    pricing: {
      daily: { type: Number, required: true },
      weekly: { type: Number, required: true },
      monthly: { type: Number, required: true },
      currency: { type: String, default: "TND" },
      deposit: { type: Number, default: 0 },
      seasonalPrices: [
        {
          name: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
          startMonth: { type: Number },
          endMonth: { type: Number },
          dailyRate: { type: Number, required: true },
          discountPercent: { type: Number, default: 0 },
        },
      ],
    },
    features: [String],
    hasAirConditioning: { type: Boolean, default: true },
    hasGPS: { type: Boolean, default: false },
    hasBluetooth: { type: Boolean, default: false },
    hasUSB: { type: Boolean, default: false },
    description: {
      fr: { type: String, default: "" },
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
    },
    maintenanceNotes: String,
    garageNotes: { type: String, default: "" },
    nextMaintenanceDate: Date,
    mileage: { type: Number, default: 0 },
    lastVidangeMileage: { type: Number, default: 0 },
    nextVidangeMileage: { type: Number, default: 10000 },
    vidangeInterval: { type: Number, default: 10000 },
    technicalInspectionDate: Date,
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    totalUnits: { type: Number, default: 3 },
    availableUnits: { type: Number, default: 3 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

VehicleSchema.index({ brand: "text", model: "text" });
VehicleSchema.index({ "pricing.daily": 1 });
VehicleSchema.index({ status: 1, categoryId: 1 });

const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", VehicleSchema);

export default Vehicle;
