"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wardrobeRouter = void 0;
exports.seedDemoWardrobeForUser = seedDemoWardrobeForUser;
exports.getOutfitsByOccasionHandler = getOutfitsByOccasionHandler;
const express_1 = require("express");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const models_1 = require("../models");
const demoSeed_1 = require("../data/demoSeed");
const clothingTagger_1 = require("../services/clothingTagger");
exports.wardrobeRouter = (0, express_1.Router)();
const DEFAULT_USER = "demo-user";
const ALLOWED_OCCASIONS = ["casual", "business", "formal", "party", "date", "outdoor", "travel"];
function resolveUserId(req) {
    const bodyUserId = typeof req.body?.userId === "string" ? req.body.userId : undefined;
    const queryUserId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    return bodyUserId || queryUserId || DEFAULT_USER;
}
function isAllowedOccasion(value) {
    return ALLOWED_OCCASIONS.includes(value);
}
async function seedDemoWardrobeForUser(userId) {
    const existingCount = await models_1.ClothingItem.countDocuments({ userId });
    if (existingCount > 0) {
        return { seeded: false, count: existingCount };
    }
    await models_1.ClothingItem.insertMany(demoSeed_1.DEMO_WARDROBE_ITEMS.map((item) => ({
        _id: item._id,
        userId,
        name: item.name,
        category: item.category,
        color: item.color,
        imageUrl: item.imageUrl,
        occasions: item.occasions,
        season: item.season,
        brand: item.brand,
        tags: item.tags,
        formality_score: item.formality_score,
        favorite: false,
        wearCount: 0,
        addedFrom: "url",
        addedAt: new Date(item.createdAt),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.createdAt),
    })));
    return { seeded: true, count: demoSeed_1.DEMO_WARDROBE_ITEMS.length };
}
async function getOutfitsByOccasionHandler(req, res) {
    try {
        const occasion = String(req.params.occasion || "").toLowerCase();
        if (!isAllowedOccasion(occasion)) {
            res.status(400).json({ error: "Invalid occasion" });
            return;
        }
        const userId = resolveUserId(req);
        const outfits = demoSeed_1.DEMO_OUTFITS[occasion] || [];
        const responsePayload = await Promise.all(outfits.map(async (outfit) => {
            const items = await models_1.ClothingItem.find({
                userId,
                _id: { $in: outfit.itemIds },
            }).sort({ createdAt: -1 });
            return {
                id: outfit.id,
                name: outfit.name,
                occasionTag: outfit.occasionTag,
                items,
            };
        }));
        res.json(responsePayload);
    }
    catch (error) {
        console.error("by-occasion error:", error);
        res.status(500).json({ error: "Failed to fetch outfits by occasion" });
    }
}
// GET /api/wardrobe — fetch all wardrobe items for the user
exports.wardrobeRouter.get("/", async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const items = await models_1.ClothingItem.find({ userId }).sort({ addedAt: -1, createdAt: -1 });
        res.json({ items, count: items.length });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch wardrobe" });
    }
});
// POST /api/wardrobe/seed-demo
exports.wardrobeRouter.post("/seed-demo", async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const seededResult = await seedDemoWardrobeForUser(userId);
        if (!seededResult.seeded) {
            res.json({ message: "Wardrobe already seeded", count: seededResult.count });
            return;
        }
        res.status(201).json({ message: "Demo wardrobe seeded", count: seededResult.count });
    }
    catch (error) {
        console.error("seed-demo error:", error);
        res.status(500).json({ error: "Failed to seed demo wardrobe" });
    }
});
// GET /api/outfits/by-occasion/:occasion (also exposed via /api/wardrobe/outfits/by-occasion/:occasion)
exports.wardrobeRouter.get("/outfits/by-occasion/:occasion", getOutfitsByOccasionHandler);
// POST /api/wardrobe/recommend-outfit — AI occasion recommendation
exports.wardrobeRouter.post("/recommend-outfit", async (req, res) => {
    try {
        const occasion = typeof req.body.occasion === "string" ? req.body.occasion.toLowerCase() : "casual";
        const userId = resolveUserId(req);
        const wardrobeItems = Array.isArray(req.body.wardrobeItems)
            ? req.body.wardrobeItems
            : await models_1.ClothingItem.find({ userId }).lean();
        const filtered = Array.isArray(wardrobeItems)
            ? wardrobeItems.filter((item) => (item.occasions || []).map((o) => o.toLowerCase()).includes(occasion))
            : [];
        if (filtered.length === 0) {
            res.json({ recommendedItemIds: [] });
            return;
        }
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey || apiKey === "sk-ant-your-key-here") {
            res.json({ recommendedItemIds: filtered.slice(0, 5).map((item) => String(item._id || item.id)) });
            return;
        }
        const anthropic = new sdk_1.default({ apiKey });
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            system: "You are a personal fashion stylist AI. Given a user's wardrobe items and a selected occasion, recommend the best complete outfit. Return a JSON array of item IDs that form the ideal outfit.",
            messages: [
                {
                    role: "user",
                    content: `Occasion: ${occasion}. My wardrobe: ${JSON.stringify(filtered)}. Recommend the best outfit combination.`,
                },
            ],
        });
        const text = message.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n");
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            res.json({ recommendedItemIds: filtered.slice(0, 5).map((item) => String(item._id || item.id)) });
            return;
        }
        const parsed = JSON.parse(jsonMatch[0]);
        const validIds = new Set(filtered.map((item) => String(item._id || item.id)));
        const recommendedItemIds = Array.isArray(parsed)
            ? parsed.map((value) => String(value)).filter((value) => validIds.has(value))
            : [];
        res.json({ recommendedItemIds });
    }
    catch (error) {
        console.error("recommend-outfit route error:", error);
        res.status(500).json({ error: "Failed to recommend outfit" });
    }
});
// POST /api/wardrobe — save new clothing item
exports.wardrobeRouter.post("/", async (req, res) => {
    try {
        const { name, category, color, brand, imageUrl, imageBase64, userId: requestUserId, addedAt, } = req.body;
        if (!name || !category || !color) {
            res.status(400).json({ error: "name, category, and color are required" });
            return;
        }
        const autoTags = await (0, clothingTagger_1.autoTagClothingItem)(String(name), String(category), String(color), String(brand || "Unknown"), typeof imageBase64 === "string" ? imageBase64 : undefined);
        const userId = typeof requestUserId === "string" ? requestUserId : DEFAULT_USER;
        const item = await models_1.ClothingItem.create({
            userId,
            name,
            category,
            color,
            imageBase64: imageBase64 || undefined,
            imageUrl: imageUrl || undefined,
            brand: brand || undefined,
            occasions: autoTags.occasions,
            tags: autoTags.tags,
            season: autoTags.season,
            formality_score: autoTags.formality_score,
            favorite: false,
            wearCount: 0,
            addedFrom: imageUrl ? "url" : "upload",
            addedAt: addedAt ? new Date(addedAt) : new Date(),
        });
        res.status(201).json({ item });
    }
    catch (error) {
        console.error("wardrobe create error:", error);
        res.status(500).json({ error: "Failed to add item" });
    }
});
// DELETE /api/wardrobe/:id — delete item by id
exports.wardrobeRouter.delete("/:id", async (req, res) => {
    try {
        const item = await models_1.ClothingItem.findByIdAndDelete(req.params.id);
        if (!item) {
            res.status(404).json({ error: "Item not found" });
            return;
        }
        res.json({ message: "Item deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete item" });
    }
});
// POST /api/wardrobe/analyze — mock AI analysis
exports.wardrobeRouter.post("/analyze", (_req, res) => {
    res.json({
        name: "Oversized Cotton Tee",
        category: "tops",
        color: "Black",
        brand: "Unknown",
        tags: ["casual", "streetwear"],
        season: "all-season",
    });
});
// POST /api/wardrobe/detect-category — AI clothing detection via Claude
exports.wardrobeRouter.post("/detect-category", async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64 || typeof imageBase64 !== "string") {
            res.status(400).json({ error: "imageBase64 is required" });
            return;
        }
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey || apiKey === "sk-ant-your-key-here") {
            res.json({ category: "Top", color: "Black", name: "My Casual Top" });
            return;
        }
        const anthropic = new sdk_1.default({ apiKey });
        let base64Data = imageBase64;
        let mediaType = "image/jpeg";
        const match = imageBase64.match(/^data:(image\/\w+);base64,/);
        if (match) {
            mediaType = match[1];
            base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        }
        const message = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 256,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: { type: "base64", media_type: mediaType, data: base64Data },
                        },
                        {
                            type: "text",
                            text: 'Look at this clothing item image. Respond with ONLY a JSON object: { "category": "Top"|"Bottom"|"Shoes"|"Accessory"|"Traditional", "color": "<main color name e.g. Black, White, Red, Navy Blue>", "name": "<short descriptive name>" }',
                        },
                    ],
                },
            ],
        });
        const text = message.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n");
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            res.json({ category: "Top", color: "Black", name: "My Clothing Item" });
            return;
        }
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({
            category: parsed.category || "Top",
            color: parsed.color || "Black",
            name: parsed.name || "My Clothing Item",
        });
    }
    catch (error) {
        console.error("detect-category error:", error);
        res.json({ category: "Top", color: "Black", name: "My Casual Top" });
    }
});
