import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailCustomField {
  id: string;
  key: string;
  label: string;
  defaultValue?: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  required?: boolean;
}

export interface IEmailTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  description?: string;
  type: string;
  language: "fr" | "en" | "ar";
  subject: string;
  preheader?: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  customFields?: IEmailCustomField[];
  isActive: boolean;
  lastEditedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: { type: String },
    description: { type: String },
    type: { type: String, required: true },
    language: { type: String, enum: ["fr", "en", "ar"], required: true },
    subject: { type: String, required: true },
    preheader: { type: String },
    htmlBody: { type: String, required: true },
    textBody: { type: String, default: "" },
    variables: [{ type: String }],
    customFields: [
      {
        id: String,
        key: String,
        label: String,
        defaultValue: String,
        type: { type: String, default: "text" },
        required: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EmailTemplateSchema.index({ type: 1, language: 1 }, { unique: true });

const EmailTemplate: Model<IEmailTemplate> =
  mongoose.models.EmailTemplate ||
  mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema);

export default EmailTemplate;
