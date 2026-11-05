import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  recipientType: "user" | "customer";
  type: string;
  title: { fr: string; en: string; ar: string };
  message: { fr: string; en: string; ar: string };
  link?: string;
  isRead: boolean;
  readAt?: Date;
  data?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true, index: true },
    recipientType: { type: String, enum: ["user", "customer"], required: true },
    type: { type: String, required: true },
    title: {
      fr: { type: String, required: true },
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    message: {
      fr: { type: String, required: true },
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    link: String,
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
