// src/middleware/fakeAuth.js
import { User } from "../models/User.js";

export async function fakeAuth(req, res, next) {
  try {
    // Try to find a test user
    let user = await User.findOne({ email: "testuser@example.com" });

    // If not found, create one
    if (!user) {
      user = await User.create({
        email: "testuser@example.com",
        passwordHash: "dev-only-placeholder", // TODO: replace when real auth is added
        displayName: "Test User",
      });
      console.log("👤 Created dev test user:", user._id.toString());
    }

    // Attach to request
    req.user = user;
    next();
  } catch (err) {
    console.error("fakeAuth error:", err);
    res.status(500).json({ error: "Internal auth error" });
  }
}
