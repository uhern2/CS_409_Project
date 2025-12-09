import express from "express";
import { User } from "../models/User.js";
import {
  generateSessionToken,
  hashPassword,
  verifyPassword,
} from "../utils/auth.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: "email, password, displayName are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      sessionTokens: [],
    });

    const { token, tokenHash } = generateSessionToken();
    user.sessionTokens.push({ tokenHash, createdAt: new Date() });
    await user.save();

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).json({ error: "Failed to sign up" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { token, tokenHash } = generateSessionToken();
    user.sessionTokens.push({ tokenHash, createdAt: new Date() });
    await user.save();

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = req.user;
  res.json({
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
  });
});
