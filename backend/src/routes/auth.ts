import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserProfile } from "../models";
import { auth, AuthRequest } from "../middleware/auth";

export const authRouter = Router();

// POST /api/auth/register
authRouter.post("/register", async (req, res: Response) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const existing = await UserProfile.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(409).json({ error: "Email or username already taken" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserProfile.create({ email, passwordHash, name, username });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserProfile.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
authRouter.get("/me", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserProfile.findById(req.userId).select("-passwordHash");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});
