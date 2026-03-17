"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoTagClothingItem = autoTagClothingItem;
async function autoTagClothingItem(name, category, color, brand, imageBase64) {
    const content = [];
    if (imageBase64) {
        content.push({
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
        });
    }
    content.push({
        type: "text",
        text: `You are a fashion AI. Analyse this clothing item.
Name: ${name}, Category: ${category}, Color: ${color}, Brand: ${brand}

Return ONLY raw JSON (no markdown, no explanation):
{
  "occasions": <array — pick from: casual, business, formal, party, date, outdoor, travel>,
  "season": <one of: summer, winter, all-season, monsoon>,
  "tags": <array of 3-5 style words>,
  "formality_score": <1-10>
}

Rules: suit/blazer→formal+business, jeans/tshirt→casual,
oxford shoes→formal+business+date, sneakers→casual+outdoor+travel.
Be generous — include all occasions where this item fits.`,
    });
    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey || "",
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 300,
                messages: [{ role: "user", content }],
            }),
        });
        const data = (await response.json());
        const text = data.content?.[0]?.text || "";
        return JSON.parse(text.replace(/```json|```/g, "").trim());
    }
    catch {
        const n = (name + category).toLowerCase();
        return {
            occasions: /suit|blazer|formal/.test(n)
                ? ["formal", "business", "party"]
                : /jeans|tshirt|hoodie/.test(n)
                    ? ["casual", "outdoor"]
                    : ["casual"],
            season: /linen|shorts/.test(n) ? "summer" : /coat|parka/.test(n) ? "winter" : "all-season",
            tags: ["versatile"],
            formality_score: /suit|formal/.test(n) ? 8 : /blazer/.test(n) ? 6 : 3,
        };
    }
}
