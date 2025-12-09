import { User } from "../models/User.js";
import { hashToken } from "../utils/auth.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid auth token" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      "sessionTokens.tokenHash": tokenHash,
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid auth token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    res.status(500).json({ error: "Auth error" });
  }
}
