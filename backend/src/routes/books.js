// src/routes/books.js
import express from "express";
import { Book } from "../models/Book.js";
import { ReadingLog } from "../models/ReadingLog.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { searchGoogleBooks } from "../googleBooks.js";

export const booksRouter = express.Router();

function mapLog(log) {
  const book = log.book;
  return {
    logId: log._id.toString(),
    id: book._id.toString(),
    title: book.title,
    author: book.author,
    genre: book.genre,
    yearPublished: book.yearPublished,
    coverUrl: book.coverUrl,
    description: book.description,
    pages: book.pages,
    startDate: log.startDate ? log.startDate.toISOString().split("T")[0] : "",
    finishDate: log.finishDate ? log.finishDate.toISOString().split("T")[0] : "",
    review: log.reviewText || "",
    rating: log.rating ?? 0,
    loggedDate: log.updatedAt ? log.updatedAt.toISOString().split("T")[0] : "",
  };
}

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

// GET /books/search?q=term - search Google Books as a fallback/remote source
booksRouter.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({ error: "q (query) is required" });
    }

    const results = await searchGoogleBooks(q, 20);
    const mapped = results.map((b, idx) => ({
      // No DB id, so use googleBooksId or fallback
      id: b.googleBooksId || `google-${idx}-${Date.now()}`,
      title: b.title,
      author: b.author,
      genre: b.genre,
      yearPublished: b.yearPublished || 0,
      coverUrl: b.coverUrl,
      description: b.description,
      pages: b.pages || 0,
      source: "google",
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Error searching Google Books:", err);
    res.status(500).json({ error: "Failed to search books" });
  }
});

// POST /books/import - create or reuse a book from an external source (e.g., Google Books)
booksRouter.post("/import", async (req, res) => {
  try {
    const {
      googleBooksId,
      title,
      author,
      genre,
      yearPublished,
      coverUrl,
      description,
      pages,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "title and author are required" });
    }

    // Try to find by googleBooksId first
    let book = null;
    if (googleBooksId) {
      book = await Book.findOne({ googleBooksId });
    }

    // If not found, create a new book
    if (!book) {
      book = await Book.create({
        googleBooksId,
        title,
        author,
        genre: genre || "Unknown",
        yearPublished: yearPublished || 0,
        coverUrl: coverUrl || "",
        description: description || "",
        pages: pages || 0,
      });
    }

    res.status(201).json({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      genre: book.genre,
      yearPublished: book.yearPublished,
      coverUrl: book.coverUrl,
      description: book.description,
      pages: book.pages,
      googleBooksId: book.googleBooksId,
    });
  } catch (err) {
    console.error("Error importing book:", err);
    res.status(500).json({ error: "Failed to import book" });
  }
});

// GET /books/:id - get a single book with rating stats and optional user log
booksRouter.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).lean();

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Aggregate rating stats and review count
    const stats = await ReadingLog.aggregate([
      { $match: { book: book._id, rating: { $ne: null } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ifNull: ["$reviewText", false] },
                    { $gt: [{ $strLenCP: { $ifNull: ["$reviewText", ""] } }, 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Recent reviews (reviewText present), include reviewer name if available
    const reviews = await ReadingLog.find({
      book: book._id,
      reviewText: { $exists: true, $ne: "" },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("user")
      .lean();

    const mappedReviews = reviews.map((log) => ({
      id: log._id.toString(),
      reviewer: log.user?.displayName || "Anonymous",
      rating: log.rating ?? 0,
      review: log.reviewText || "",
      loggedDate: log.updatedAt
        ? log.updatedAt.toISOString().split("T")[0]
        : "",
    }));

    let userLog = null;
    if (req.user) {
      const log = await ReadingLog.findOne({
        user: req.user._id,
        book: book._id,
      })
        .populate("book")
        .lean();

      if (log) {
        userLog = mapLog(log);
      }
    }

    res.json({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      genre: book.genre,
      yearPublished: book.yearPublished,
      coverUrl: book.coverUrl,
      description: book.description,
      pages: book.pages,
      averageRating: stats[0]?.averageRating ?? null,
      reviewCount: stats[0]?.reviewCount ?? 0,
      userLog,
      reviews: mappedReviews,
    });
  } catch (err) {
    console.error("Error fetching book by id:", err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});
