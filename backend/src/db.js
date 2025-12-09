// src/db.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env");
}

export async function connectDB() {
  try {
    // If your URI already has /booklog at the end, you don't need dbName here.
    await mongoose.connect(MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    // Optional: log connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}
