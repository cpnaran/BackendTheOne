import express from "express";
import features from "../feature/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import feature from "../feature/index.js";
import { jwtRefreshTokenValidate } from "../middleware/auth.js";
const router = express.Router();

router.post("/", LoginBo);
router.post("/refresh", jwtRefreshTokenValidate, jwtRefreshToken);

async function LoginBo(req, res, next) {
  try {
    const { username, password } = req.body;
    const hashedPassword = Buffer.from(
      process.env.AUTH_PASSWORD,
      "base64"
    ).toString("ascii");
    // Check credentials from .env

    if (
      username === process.env.AUTH_USERNAME &&
      bcrypt.compareSync(password, hashedPassword)
    ) {
      const user = { name: username };
      const token = feature.auth.generateToken(user);
      const refresh_token = feature.auth.generateRefreshToken(user);

      return res.json({ token, refresh_token });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function jwtRefreshToken(req, res, next) {
  const username = req.username;

  if (!username === process.env.AUTH_USERNAME) {
    res.status(401).json({ message: "Invalid credentials" });
  }

  if (!username) return res.sendStatus(401);
  const user = { name: username };
  const token = feature.auth.generateToken(user);

  return res.json({
    token,
  });
}

export default router;
