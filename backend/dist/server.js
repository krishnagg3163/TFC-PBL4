"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const wardrobe_1 = require("./routes/wardrobe");
const outfit_1 = require("./routes/outfit");
const stylist_1 = require("./routes/stylist");
const finder_1 = require("./routes/finder");
const rater_1 = require("./routes/rater");
const auth_1 = require("./routes/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/api/auth", auth_1.authRouter);
app.use("/api/wardrobe", wardrobe_1.wardrobeRouter);
app.get("/api/outfits/by-occasion/:occasion", wardrobe_1.getOutfitsByOccasionHandler);
app.use("/api/outfit", outfit_1.outfitRouter);
app.use("/api/stylist", stylist_1.stylistRouter);
app.use("/api/finder", finder_1.finderRouter);
app.use("/api/rate", rater_1.raterRouter);
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "TFC Backend" });
});
(0, db_1.connectDB)().then(() => {
    app.listen(PORT, () => {
        console.log(`TFC Backend running on http://localhost:${PORT}`);
    });
});
exports.default = app;
