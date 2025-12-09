// src/seed.js
import "dotenv/config";
import { connectDB } from "./db.js";
import { Book } from "./models/Book.js";

const seedBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    yearPublished: 1925,
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    description:
      "A classic novel set in the Jazz Age that explores themes of decadence, idealism, and excess.",
    pages: 180,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    yearPublished: 1960,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    description:
      "A gripping tale of racial injustice and childhood innocence in the American South.",
    pages: 324,
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Science Fiction",
    yearPublished: 1949,
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    description:
      "A dystopian social science fiction novel and cautionary tale about totalitarianism.",
    pages: 328,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    yearPublished: 1813,
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    description:
      "A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.",
    pages: 432,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    yearPublished: 1937,
    coverUrl: "https://images.unsplash.com/photo-1621351183012-e2f3db3a5b2d?w=400&h=600&fit=crop",
    description:
      "A fantasy novel about the quest of home-loving Bilbo Baggins to win a share of treasure guarded by a dragon.",
    pages: 310,
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    yearPublished: 1951,
    coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
    description:
      "A story about teenage rebellion and alienation narrated by Holden Caulfield.",
    pages: 277,
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    yearPublished: 1997,
    coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop",
    description:
      "The first novel in the Harry Potter series following a young wizard's first year at Hogwarts.",
    pages: 309,
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    yearPublished: 1954,
    coverUrl: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=400&h=600&fit=crop",
    description:
      "An epic high fantasy novel following the quest to destroy the One Ring.",
    pages: 1178,
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    genre: "Mystery",
    yearPublished: 2003,
    coverUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
    description:
      "A mystery thriller novel following symbologist Robert Langdon as he investigates a murder.",
    pages: 454,
  },
  {
    title: "The Hunger Games",
    author: "Suzanne Collins",
    genre: "Science Fiction",
    yearPublished: 2008,
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=600&fit=crop",
    description:
      "A dystopian novel set in a post-apocalyptic nation where teenagers fight to the death on live television.",
    pages: 374,
  },
];

async function seed() {
  try {
    await connectDB();

    console.log("🧹 Clearing existing books...");
    await Book.deleteMany({});

    console.log("🌱 Inserting seed books...");
    const created = await Book.insertMany(seedBooks);

    console.log(`✅ Seeded ${created.length} books.`);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    // Close the process so script exits
    process.exit(0);
  }
}

seed();
