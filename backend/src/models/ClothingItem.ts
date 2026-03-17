import mongoose, { Schema, Document } from "mongoose";

export interface IClothingItem extends Document {
  userId: string;
  name: string;
  category: "tops" | "bottoms" | "shoes" | "accessories" | "outerwear" | "dresses" | "activewear" | "formal";
  color: string;
  secondaryColor?: string;
  imageUrl?: string;
  imageBase64?: string;
  brand?: string;
  price?: number;
  size?: string;
  material?: string;
  tags: string[];
  season: ("spring" | "summer" | "fall" | "winter" | "all")[];
  favorite: boolean;
  wearCount: number;
  lastWorn?: Date;
  addedFrom: "upload" | "camera" | "url" | "swipe";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClothingItemSchema = new Schema<IClothingItem>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["tops", "bottoms", "shoes", "accessories", "outerwear", "dresses", "activewear", "formal"],
    },
    color: { type: String, required: true },
    secondaryColor: { type: String },
    imageUrl: { type: String },
    imageBase64: { type: String },
    brand: { type: String, trim: true },
    price: { type: Number, min: 0 },
    size: { type: String },
    material: { type: String },
    tags: [{ type: String, trim: true }],
    season: [{ type: String, enum: ["spring", "summer", "fall", "winter", "all"] }],
    favorite: { type: Boolean, default: false },
    wearCount: { type: Number, default: 0, min: 0 },
    lastWorn: { type: Date },
    addedFrom: { type: String, enum: ["upload", "camera", "url", "swipe"], default: "upload" },
    notes: { type: String },
  },
  { timestamps: true }
);

ClothingItemSchema.index({ userId: 1, category: 1 });
ClothingItemSchema.index({ userId: 1, favorite: 1 });

export const ClothingItem = mongoose.model<IClothingItem>("ClothingItem", ClothingItemSchema);
