import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  email: string;
  passwordHash: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  stylePreferences: string[];
  favoriteColors: string[];
  sizes: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 300 },
    stylePreferences: [{ type: String }],
    favoriteColors: [{ type: String }],
    sizes: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
