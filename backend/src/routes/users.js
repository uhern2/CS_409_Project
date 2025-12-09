// src/routes/users.js
import express from "express";

export const usersRouter = express.Router();

// Fake user profile data structure
let fakeUserProfile = {
  name: "Book Lover",
  email: "booklover@example.com",
  totalBooksLogged: 12,
  averageRating: 4.25,
};

// GET /users/me - get current user profile with stats (fake data)
usersRouter.get("/me", (req, res) => {
  try {
    // Return fake user profile data
    res.json(fakeUserProfile);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// PUT /users/me - update user profile (displayName) (fake data)
usersRouter.put("/me", (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Update fake user profile
    fakeUserProfile.name = name.trim();

    // Return updated profile
    res.json(fakeUserProfile);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

