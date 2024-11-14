import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = user;
    next();
  });
}

export const jwtRefreshTokenValidate = (req, res, next) => {
  if (!req.headers["authorization"]) return res.sendStatus(401);
  const token = req.headers["authorization"];

  jwt.verify(token, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token." });

    req.username = decoded;

    next();
  });
};
