// src/routes/books.js
import express from "express";
import { Book } from "../models/Book.js";
import { ReadingLog } from "../models/ReadingLog.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

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
