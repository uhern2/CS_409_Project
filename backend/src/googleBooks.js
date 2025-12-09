// src/googleBooks.js
import axios from "axios";

// Search Google Books
export async function searchGoogleBooks(query, maxResults = 15) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
    const response = await axios.get(url);

    if (!response.data.items) return [];

    // Map Google Books API data to our book structure
    const books = response.data.items.map((item) => {
      const info = item.volumeInfo;
      return {
        title: info.title || "No title",
        author: (info.authors && info.authors.join(", ")) || "Unknown",
        genre: (info.categories && info.categories.join(", ")) || "Unknown",
        yearPublished: info.publishedDate ? parseInt(info.publishedDate.slice(0, 4)) : null,
        coverUrl: info.imageLinks?.thumbnail || "",
        description: info.description || "",
        pages: info.pageCount || null,
        googleBooksId: item.id,
      };
    });

    return books;
  } catch (err) {
    console.error("Error fetching from Google Books:", err.message);
    return [];
  }
}
