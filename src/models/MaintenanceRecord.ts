import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaintenanceRecord extends Document {
  _id: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  type: "scheduled" | "unscheduled" | "inspection" | "repair";
  description: string;
  startDate: Date;
  endDate?: Date;
  cost?: number;
  provider?: string;
  notes?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  recordedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRecordSchema = new Schema<IMaintenanceRecord>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    type: {
      type: String,
      enum: ["scheduled", "unscheduled", "inspection", "repair"],
      required: true,
    },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    cost: Number,
    provider: String,
    notes: String,
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const MaintenanceRecord: Model<IMaintenanceRecord> =
  mongoose.models.MaintenanceRecord ||
  mongoose.model<IMaintenanceRecord>("MaintenanceRecord", MaintenanceRecordSchema);

export default MaintenanceRecord;
