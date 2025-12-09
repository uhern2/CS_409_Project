import { User } from "../models/User.js";
import { hashToken } from "../utils/auth.js";

export async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const tokenHash = hashToken(token);

      const user = await User.findOne({
        "sessionTokens.tokenHash": tokenHash,
      });

      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    console.error("optionalAuth error:", err);
  } finally {
    next();
  }
}
