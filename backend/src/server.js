// src/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import { fakeAuth } from "./middleware/fakeAuth.js";
import { booksRouter } from "./routes/books.js";
import { logsRouter } from "./routes/logs.js";
import { usersRouter } from "./routes/users.js";

const app = express();

app.use(cors());
app.use(express.json());

// dev-only fake auth: attaches req.user
app.use(fakeAuth);

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/books", booksRouter);
app.use("/logs", logsRouter);
app.use("/users", usersRouter);

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Error starting server:", err);
});
