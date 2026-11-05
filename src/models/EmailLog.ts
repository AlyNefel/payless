import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailLog extends Document {
  _id: mongoose.Types.ObjectId;
  to: string;
  toName?: string;
  subject: string;
  templateType: string;
  language: "fr" | "en" | "ar";
  bookingId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  status: "pending" | "sent" | "failed" | "bounced";
  messageId?: string;
  error?: string;
  retryCount: number;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    to: { type: String, required: true },
    toName: String,
    subject: { type: String, required: true },
    templateType: { type: String, required: true },
    language: { type: String, enum: ["fr", "en", "ar"], default: "fr" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "bounced"],
      default: "pending",
      index: true,
    },
    messageId: String,
    error: String,
    retryCount: { type: Number, default: 0 },
    sentAt: Date,
  },
  { timestamps: true }
);

const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog ||
  mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
