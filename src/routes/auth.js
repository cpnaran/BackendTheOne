import express from "express";
import features from "../feature/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", LoginBo);

async function LoginBo(req, res, next) {
  try {
    const { username, password } = req.body;

    // Check credentials from .env
    if (
      username === process.env.AUTH_USERNAME &&
      bcrypt.compareSync(password, process.env.AUTH_PASSWORD)
    ) {
      const user = { name: username };
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ token });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default router;
