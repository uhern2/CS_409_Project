// src/routes/users.js
import express from "express";
import { ReadingLog } from "../models/ReadingLog.js";

export const usersRouter = express.Router();

// GET /users/me - real user data from req.user
usersRouter.get("/me", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Basic stats
    const logs = await ReadingLog.find({ user: user._id }).lean();
    const totalBooksLogged = logs.length;
    const ratings = logs
      .map((l) => l.rating)
      .filter((r) => typeof r === "number");
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

    res.json({
      name: user.displayName,
      email: user.email,
      totalBooksLogged,
      averageRating,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// PUT /users/me - update displayName
usersRouter.put("/me", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    user.displayName = name.trim();
    await user.save();

    res.json({
      name: user.displayName,
      email: user.email,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});
