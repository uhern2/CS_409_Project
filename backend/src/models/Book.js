// src/models/Book.js
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      // single author string to match your frontend, maybe change into array later
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    yearPublished: {
      type: Number,
      required: true,
    },
    coverUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    pages: {
      type: Number,
    },
    // optional: for future Google Books integration
    googleBooksId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);
