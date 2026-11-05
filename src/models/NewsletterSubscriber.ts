import mongoose, { Schema, Document, Model } from "mongoose";

export interface INewsletterSubscriber extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  language: "fr" | "en" | "ar";
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: String,
    language: { type: String, enum: ["fr", "en", "ar"], default: "fr" },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
    source: String,
  },
  { timestamps: true }
);

const NewsletterSubscriber: Model<INewsletterSubscriber> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>(
    "NewsletterSubscriber",
    NewsletterSubscriberSchema
  );

export default NewsletterSubscriber;
