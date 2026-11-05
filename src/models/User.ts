import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "superadmin" | "admin" | "manager" | "staff" | "client";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: {
    language: "fr" | "en" | "ar";
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["superadmin", "admin", "manager", "staff", "client"],
      default: "staff",
    },
    avatar: String,
    phone: String,
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
    preferences: {
      language: { type: String, enum: ["fr", "en", "ar"], default: "fr" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
