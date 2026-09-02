const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");

/**
 * Middleware to protect routes via JWT verification
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found or token invalid" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Account has been suspended by Administrator" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[AUTH MIDDLEWARE ERROR]", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
