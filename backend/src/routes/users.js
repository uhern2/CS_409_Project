// src/routes/users.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";
import { ReadingLog } from "../models/ReadingLog.js";

export const usersRouter = express.Router();

// GET /users/me - get current user profile with stats
usersRouter.get("/me", requireAuth, async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch user's reading logs
    const logs = await ReadingLog.find({ user: user._id }).lean();

    const totalBooksLogged = logs.length;
    const ratings = logs.filter((log) => log.rating != null).map((log) => log.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null;

    res.json({
      id: user._id.toString(),
      name: user.displayName || user.name || "Unnamed User",
      email: user.email,
      totalBooksLogged,
      averageRating: averageRating !== null ? Number(averageRating.toFixed(2)) : null,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// PUT /users/me - update user profile (displayName)
usersRouter.put("/me", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { displayName: name.trim() },
      { new: true }
    ).lean();

    res.json({
      id: updatedUser._id.toString(),
      name: updatedUser.displayName,
      email: updatedUser.email,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});
