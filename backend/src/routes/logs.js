// src/routes/logs.js
import express from "express";
import { ReadingLog } from "../models/ReadingLog.js";

export const logsRouter = express.Router();

function mapLog(log) {
  const book = log.book;
  return {
    // log identifier
    logId: log._id.toString(),

    // book fields - match your frontend Book type
    id: book._id.toString(),
    title: book.title,
    author: book.author,
    genre: book.genre,
    yearPublished: book.yearPublished,
    coverUrl: book.coverUrl,
    description: book.description,
    pages: book.pages,

    // log fields - match your LoggedBook type
    startDate: log.startDate ? log.startDate.toISOString().split("T")[0] : "",
    finishDate: log.finishDate ? log.finishDate.toISOString().split("T")[0] : "",
    review: log.reviewText || "",
    rating: log.rating ?? 0,
    loggedDate: log.updatedAt ? log.updatedAt.toISOString().split("T")[0] : "",
  };
}

// GET /logs/me - get all logs for current user (My Books)
logsRouter.get("/me", async (req, res) => {
  try {
    const userId = req.user._id;

    const logs = await ReadingLog.find({ user: userId })
      .populate("book")
      .sort({ updatedAt: -1 })
      .lean();

    const mapped = logs.map((log) => mapLog(log));

    res.json(mapped);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch reading logs" });
  }
});

// POST /logs - create a new log
logsRouter.post("/", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bookId,
      startDate,
      finishDate,
      status,
      rating,
      reviewText,
    } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: "bookId is required" });
    }

    const log = await ReadingLog.create({
      user: userId,
      book: bookId,
      startDate,
      finishDate,
      status,
      rating,
      reviewText,
    });

    const populated = await log.populate("book");
    res.status(201).json(mapLog(populated));
  } catch (err) {
    console.error("Error creating log:", err);
    res.status(500).json({ error: "Failed to create reading log" });
  }
});

// PUT /logs/:id - update an existing log (edit log)
logsRouter.put("/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const log = await ReadingLog.findOne({ _id: id, user: userId });

    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    const {
      startDate,
      finishDate,
      status,
      rating,
      reviewText,
    } = req.body;

    if (startDate !== undefined) log.startDate = startDate;
    if (finishDate !== undefined) log.finishDate = finishDate;
    if (status !== undefined) log.status = status;
    if (rating !== undefined) log.rating = rating;
    if (reviewText !== undefined) log.reviewText = reviewText;

    await log.save();
    const populated = await log.populate("book");
    res.json(mapLog(populated));
  } catch (err) {
    console.error("Error updating log:", err);
    res.status(500).json({ error: "Failed to update reading log" });
  }
});

// DELETE /logs/:id - delete a log
logsRouter.delete("/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await ReadingLog.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting log:", err);
    res.status(500).json({ error: "Failed to delete reading log" });
  }
});
