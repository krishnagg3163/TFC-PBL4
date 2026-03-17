import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  wardrobeItems: mongoose.Types.ObjectId[];
  savedOutfits: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional — Google OAuth users won't have one
    image: { type: String },
    wardrobeItems: [{ type: Schema.Types.ObjectId, ref: "WardrobeItem" }],
    savedOutfits: [{ type: Schema.Types.ObjectId, ref: "Outfit" }],
  },
  { timestamps: true },
);

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
