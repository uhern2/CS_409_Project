// src/routes/books.js
import express from "express";
import { Book } from "../models/Book.js";

export const booksRouter = express.Router();

// GET /books - list all books
booksRouter.get("/", async (req, res) => {
  try {
    const books = await Book.find().limit(50).lean();

    // Map _id -> id so it matches your frontend type
    const mapped = books.map((b) => ({
      id: b._id.toString(),
      title: b.title,
      author: b.author,
      genre: b.genre,
      yearPublished: b.yearPublished,
      coverUrl: b.coverUrl,
      description: b.description,
      pages: b.pages,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});
