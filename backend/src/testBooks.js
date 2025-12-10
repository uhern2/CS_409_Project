import mongoose from "mongoose";
import "dotenv/config";
import { searchGoogleBooks, saveBooksToDB } from "./googleBooks.js";
import { connectDB } from "./db.js";

async function test() {
  await connectDB(); // connects to your MongoDB

  const books = await searchGoogleBooks("Harry Potter", 5); // search for 5 books
  console.log("Fetched books:", books);

  await saveBooksToDB(books); // save them to MongoDB
  console.log("Books saved to MongoDB successfully");

  process.exit();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});