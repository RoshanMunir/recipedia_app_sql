const jwt = require("jsonwebtoken");

// Use JWT_SECRET from .env, fallback to a default for safety
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware to protect routes
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  // Expect header format: "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // store decoded user info for later use
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error });
  }
};

module.exports = authenticate;
