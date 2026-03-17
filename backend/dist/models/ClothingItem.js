"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClothingItem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ClothingItemSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
        type: String,
        required: true,
        enum: ["tops", "bottoms", "shoes", "accessories", "outerwear", "dresses", "activewear", "formal", "full-outfit"],
    },
    color: { type: String, required: true },
    secondaryColor: { type: String },
    imageUrl: { type: String },
    imageBase64: { type: String },
    brand: { type: String, trim: true },
    formality_score: { type: Number, min: 1, max: 10, default: 5 },
    price: { type: Number, min: 0 },
    size: { type: String },
    material: { type: String },
    occasions: [{ type: String, trim: true, lowercase: true }],
    tags: [{ type: String, trim: true }],
    season: { type: String, enum: ["summer", "winter", "all-season", "monsoon"], default: "all-season" },
    favorite: { type: Boolean, default: false },
    wearCount: { type: Number, default: 0, min: 0 },
    lastWorn: { type: Date },
    addedFrom: { type: String, enum: ["upload", "camera", "url", "swipe"], default: "upload" },
    notes: { type: String },
    addedAt: { type: Date, default: Date.now },
}, { timestamps: true });
ClothingItemSchema.index({ userId: 1, category: 1 });
ClothingItemSchema.index({ userId: 1, favorite: 1 });
exports.ClothingItem = mongoose_1.default.model("ClothingItem", ClothingItemSchema);
