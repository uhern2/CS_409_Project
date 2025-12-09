// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true, // we'll add real auth later
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// sessionTokens is used for simple stateless auth tokens (hashed)
userSchema.add({
  sessionTokens: [
    {
      tokenHash: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export const User = mongoose.model("User", userSchema);
