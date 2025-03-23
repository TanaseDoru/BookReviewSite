// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log("No token provided"); // Debug log
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Should contain { id: userId, ...otherData }
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message); // Debug log
    res.status(401).json({ message: "Token is not valid" });
  }
};

