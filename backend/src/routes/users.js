// src/routes/users.js
import express from "express";
import { User } from "../models/User.js";
import { ReadingLog } from "../models/ReadingLog.js";

export const usersRouter = express.Router();

// Fake user profile data structure
let fakeUserProfile = {
  name: "Book Lover",
  email: "booklover@example.com",
  totalBooksLogged: 12,
  averageRating: 4.25,
};

// // GET /users/me - get current user profile with stats (fake data)
// usersRouter.get("/me", (req, res) => {
//   try {
//     // Return fake user profile data
//     res.json(fakeUserProfile);
//   } catch (err) {
//     console.error("Error fetching user profile:", err);
//     res.status(500).json({ error: "Failed to fetch user profile" });
//   }
// });

// GET /users/me - get current user profile with stats
usersRouter.get("/me", async (req, res) => {  
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("displayName email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const logs = await ReadingLog.find({ user: userId })
          // .populate("book")
          // .sort({ updatedAt: -1 })
          .lean();
    
    const stats = calculateStats(logs);

    res.json({
      name: user.displayName,
      email: user.email,
      totalBooksLogged: stats.totalBooksLogged,     
      averageRating: stats.averageRating,   
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});


// // PUT /users/me - update user profile (displayName) (fake data)
// usersRouter.put("/me", (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name || typeof name !== "string" || name.trim().length === 0) {
//       return res.status(400).json({ error: "Name is required" });
//     }

//     // Update fake user profile
//     fakeUserProfile.name = name.trim();

//     // Return updated profile
//     res.json(fakeUserProfile);
//   } catch (err) {
//     console.error("Error updating user profile:", err);
//     res.status(500).json({ error: "Failed to update user profile" });
//   }
// });

// PUT /users/me - update user profile (displayName)
usersRouter.put("/me", async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    // 只更新 displayName（最小写入）
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { displayName: name.trim() },
      { new: true, runValidators: true }
    ).select("displayName email");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 即时重新计算 stats
    const logs = await ReadingLog.find({ user: userId }).lean();

    const stats = calculateStats(logs);

    res.json({
      name: updatedUser.displayName,
      email: updatedUser.email,
      totalBooksLogged: stats.totalBooksLogged,     
      averageRating: stats.averageRating,   
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});



// Helper to calculate stats from logs
function calculateStats(logs) {
  const totalBooksLogged = logs.length;

  // 只取真正有 rating 的（防止 null / undefined / 0 噪声）
  const ratedLogs = logs.filter(
    (log) => typeof log.rating === "number"
  );

  const averageRating =
    ratedLogs.length > 0
      ? ratedLogs.reduce((sum, log) => sum + log.rating, 0) /
        ratedLogs.length
      : null;

  return {
    totalBooksLogged,
    averageRating,
  };
}
