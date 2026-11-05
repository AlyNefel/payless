import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  address?: string;
  dateOfBirth?: Date;
  drivingLicence?: {
    number: string;
    country: string;
    expiryDate?: Date;
  };
  passportNumber?: string;
  preferredLanguage: "fr" | "en" | "ar";
  totalBookings: number;
  totalSpent: number; // in minor units (cents/centimes)
  isBlacklisted: boolean;
  blacklistReason?: string;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: String,
    address: String,
    dateOfBirth: Date,
    drivingLicence: {
      number: String,
      country: String,
      expiryDate: Date,
    },
    passportNumber: String,
    preferredLanguage: {
      type: String,
      enum: ["fr", "en", "ar"],
      default: "fr",
    },
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: String,
    notes: { type: String, default: "" },
    tags: [String],
  },
  { timestamps: true }
);

CustomerSchema.index({ firstName: "text", lastName: "text", email: "text", phone: "text" });

const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
