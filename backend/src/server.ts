import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";
import { wardrobeRouter } from "./routes/wardrobe";
import { outfitRouter } from "./routes/outfit";
import { stylistRouter } from "./routes/stylist";
import { finderRouter } from "./routes/finder";
import { raterRouter } from "./routes/rater";
import { authRouter } from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/wardrobe", wardrobeRouter);
app.use("/api/outfit", outfitRouter);
app.use("/api/stylist", stylistRouter);
app.use("/api/finder", finderRouter);
app.use("/api/rate", raterRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "TFC Backend", timestamp: new Date().toISOString() });
});

// Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`TFC Backend running on http://localhost:${PORT}`);
  });
});

export default app;
