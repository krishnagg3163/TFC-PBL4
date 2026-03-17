"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outfitRouter = void 0;
const express_1 = require("express");
exports.outfitRouter = (0, express_1.Router)();
exports.outfitRouter.post("/generate", (_req, res) => {
    res.json({
        outfits: [
            {
                id: 1,
                name: "Casual Look",
                items: ["white tshirt", "blue jeans", "white sneakers"],
            },
        ],
    });
});
exports.outfitRouter.post("/glowup", (_req, res) => {
    res.json({
        overallScore: 6.5,
        glowedUpScore: 9.2,
        summary: "Your outfit has a solid casual foundation but lacks intentional styling. With a few tweaks — swapping sneakers for leather boots, adding a structured bag, and tucking in the front of the shirt — you can elevate this from 'running errands' to 'effortlessly stylish'.",
        tips: [
            {
                id: "t1",
                title: "French tuck the shirt",
                description: "Tuck just the front of your shirt into your waistband. It defines your waist and instantly looks more intentional.",
                impact: "high",
                category: "fit",
            },
            {
                id: "t2",
                title: "Swap sneakers for Chelsea boots",
                description: "Replace the bulky trainers with sleek Chelsea boots in black or tan leather for a cleaner silhouette.",
                impact: "high",
                category: "shoes",
            },
            {
                id: "t3",
                title: "Add a minimal watch",
                description: "A slim silver or gold watch adds a subtle touch of sophistication without overdoing it.",
                impact: "medium",
                category: "accessories",
            },
            {
                id: "t4",
                title: "Layer with a structured jacket",
                description: "Throw on a fitted bomber or blazer to add dimension and frame your upper body.",
                impact: "high",
                category: "outerwear",
            },
            {
                id: "t5",
                title: "Switch to a leather crossbody bag",
                description: "Ditch the backpack. A compact crossbody in brown or black leather keeps things sleek.",
                impact: "medium",
                category: "accessories",
            },
        ],
    });
});
