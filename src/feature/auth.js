import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

  return token;
};

export const generateRefreshToken = (user) => {
  const token = jwt.sign(user, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "1d",
  });

  return token;
};
