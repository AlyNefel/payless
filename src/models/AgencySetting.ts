import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAgencySetting extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: unknown;
  group: string;
  label: string;
  type: "string" | "number" | "boolean" | "json" | "array";
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const AgencySettingSchema = new Schema<IAgencySetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    group: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json", "array"],
      default: "string",
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const AgencySetting: Model<IAgencySetting> =
  mongoose.models.AgencySetting ||
  mongoose.model<IAgencySetting>("AgencySetting", AgencySettingSchema);

export default AgencySetting;
