const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { JWT_SECRET } = require("../config/env");

class AuthService {
  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  async registerUser({ username, email, password, role }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role && ["User", "Admin", "Auditor"].includes(role) ? role : "User",
    });

    await user.save();

    await AuditLog.create({
      action: "USER_REGISTERED",
      user: user._id,
      userEmail: user.email,
      role: user.role,
      details: { username: user.username, role: user.role },
    });

    return user;
  }

  async loginUser({ email, password, ipAddress, userAgent }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 400;
      throw error;
    }

    if (user.status === "suspended") {
      const error = new Error("Account has been suspended");
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await AuditLog.create({
        action: "LOGIN_FAILED",
        userEmail: email,
        ipAddress: ipAddress || "127.0.0.1",
        userAgent: userAgent || "",
        status: "FAILED",
        details: { reason: "Invalid Password" },
      });

      const error = new Error("Invalid Password");
      error.statusCode = 400;
      throw error;
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    await AuditLog.create({
      action: "LOGIN_SUCCESS",
      user: user._id,
      userEmail: user.email,
      role: user.role,
      ipAddress: ipAddress || "127.0.0.1",
      userAgent: userAgent || "",
      status: "SUCCESS",
    });

    return { user, token: accessToken, refreshToken };
  }

  async refreshTokenRotation(refreshTokenInput) {
    if (!refreshTokenInput) {
      const error = new Error("Refresh token required");
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(refreshTokenInput, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshTokenInput) {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  async logoutUser(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return true;
  }
}

module.exports = new AuthService();
