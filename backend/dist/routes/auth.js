"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const wardrobe_1 = require("./wardrobe");
exports.authRouter = (0, express_1.Router)();
// POST /api/auth/register
exports.authRouter.post("/register", async (req, res) => {
    try {
        const { email, password, name, username } = req.body;
        if (!email || !password || !name || !username) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const existing = await models_1.UserProfile.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            res.status(409).json({ error: "Email or username already taken" });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await models_1.UserProfile.create({ email, passwordHash, name, username });
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            token,
            user: { id: user._id, email: user.email, name: user.name, username: user.username },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});
// POST /api/auth/login
exports.authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await models_1.UserProfile.findOne({ email });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        if (user.email === "demo@tfc.com") {
            // Fire-and-forget seeding so login response is not blocked.
            void (0, wardrobe_1.seedDemoWardrobeForUser)(String(user._id)).catch((error) => {
                console.error("demo auto-seed failed:", error);
            });
        }
        res.json({
            token,
            user: { id: user._id, email: user.email, name: user.name, username: user.username },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});
// GET /api/auth/me
exports.authRouter.get("/me", auth_1.auth, async (req, res) => {
    try {
        const user = await models_1.UserProfile.findById(req.userId).select("-passwordHash");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});
