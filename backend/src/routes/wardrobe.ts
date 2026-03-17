import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { ClothingItem } from "../models";

export const wardrobeRouter = Router();

const DEFAULT_USER = "demo-user";

// GET /api/wardrobe — fetch all wardrobe items for the user
wardrobeRouter.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || DEFAULT_USER;
    const items = await ClothingItem.find({ userId }).sort({ createdAt: -1 });
    res.json({ items, count: items.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wardrobe" });
  }
});

// POST /api/wardrobe — save new clothing item
wardrobeRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, category, color, imageBase64 } = req.body;

    if (!name || !category || !color) {
      res.status(400).json({ error: "name, category, and color are required" });
      return;
    }

    const item = await ClothingItem.create({
      userId: DEFAULT_USER,
      name,
      category,
      color,
      imageBase64: imageBase64 || undefined,
      tags: [],
      season: ["all"],
      favorite: false,
      wearCount: 0,
      addedFrom: "upload",
    });

    res.status(201).json({ item });
  } catch (error) {
    res.status(500).json({ error: "Failed to add item" });
  }
});

// DELETE /api/wardrobe/:id — delete item by id
wardrobeRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const item = await ClothingItem.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// POST /api/wardrobe/analyze — mock AI analysis
wardrobeRouter.post("/analyze", (_req: Request, res: Response) => {
  res.json({
    name: "Oversized Cotton Tee",
    category: "tops",
    color: "#1a1a1a",
    brand: "Unknown",
    tags: ["casual", "streetwear"],
    season: ["spring", "summer"],
  });
});

// POST /api/wardrobe/detect-category — AI clothing detection via Claude
wardrobeRouter.post("/detect-category", async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "sk-ant-your-key-here") {
      // No API key configured — return mock detection
      res.json({ category: "Top", color: "Black", name: "My Casual Top" });
      return;
    }

    const anthropic = new Anthropic({ apiKey });

    // Strip data:image prefix for the API
    let base64Data = imageBase64;
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";
    const match = imageBase64.match(/^data:(image\/\w+);base64,/);
    if (match) {
      mediaType = match[1] as typeof mediaType;
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

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";
    // Extract JSON from response
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
  } catch (error) {
    console.error("detect-category error:", error);
    // Fallback on any error
    res.json({ category: "Top", color: "Black", name: "My Casual Top" });
  }
});
