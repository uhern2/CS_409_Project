// src/seedReadingLogs.js
import "dotenv/config";
import { connectDB } from "./db.js";
import { Book } from "./models/Book.js";
import { ReadingLog } from "./models/ReadingLog.js";
import { User } from "./models/User.js";

const logSeeds = [
  {
    title: "1984",
    startDate: "2024-07-01",
    finishDate: "2024-07-15",
    rating: 5,
    reviewText: "Chilling and timeless. Orwell's warnings feel more relevant every year.",
  },
  {
    title: "The Great Gatsby",
    startDate: "2024-06-01",
    finishDate: "2024-06-12",
    rating: 4,
    reviewText: "Gorgeous prose and a sharp take on the American dream.",
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    startDate: "2024-05-10",
    finishDate: "2024-05-25",
    rating: 5,
    reviewText: "Whimsical and cozy; still magical on a reread.",
  },
  {
    title: "Sapiens",
    startDate: "2024-04-01",
    finishDate: "2024-04-22",
    rating: 4,
    reviewText: "Big-picture history made accessible; lots to ponder.",
  },
];

async function seedReadingLogs() {
  try {
    await connectDB();

    // Use dev fakeAuth user or create if missing
    let user = await User.findOne({ email: "testuser@example.com" });
    if (!user) {
      user = await User.create({
        email: "testuser@example.com",
        passwordHash: "dev-only-placeholder",
        displayName: "Test User",
      });
      console.log("👤 Created dev test user:", user._id.toString());
    }

    // Index books by title for quick lookup
    const books = await Book.find().lean();
    const booksByTitle = books.reduce((acc, book) => {
      acc[book.title] = book;
      return acc;
    }, {});

    // Remove old logs for this user to avoid duplicates
    await ReadingLog.deleteMany({ user: user._id });

    const docs = [];
    for (const seed of logSeeds) {
      const book = booksByTitle[seed.title];
      if (!book) {
        console.warn(`⚠️ Skipping log for "${seed.title}" because the book is not in the database.`);
        continue;
      }

      docs.push({
        user: user._id,
        book: book._id,
        startDate: new Date(seed.startDate),
        finishDate: new Date(seed.finishDate),
        status: "completed",
        rating: seed.rating,
        reviewText: seed.reviewText,
      });
    }

    if (docs.length === 0) {
      console.log("No matching books found for seed logs. Seed books first, then rerun.");
      process.exit(0);
    }

    const created = await ReadingLog.insertMany(docs);
    console.log(`✅ Seeded ${created.length} reading logs for user ${user.email}.`);
  } catch (err) {
    console.error("❌ Error seeding reading logs:", err);
  } finally {
    process.exit(0);
  }
}

seedReadingLogs();
