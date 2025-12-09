// src/models/ReadingLog.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const readingLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    startDate: {
      type: Date,
    },
    finishDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["completed", "in-progress", "abandoned"],
      default: "completed",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const ReadingLog = mongoose.model("ReadingLog", readingLogSchema);

