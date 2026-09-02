const authService = require("../services/authService");

// REGISTER USER
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const user = await authService.registerUser({ username, email, password, role });

    return res.status(201).json({
      message: "User Registered Successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[AUTH REGISTER ERROR]", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Server Error",
    });
  }
};

// LOGIN USER
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const { user, token, refreshToken } = await authService.loginUser({
      email,
      password,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    return res.status(200).json({
      message: "Login Successful",
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error("[AUTH LOGIN ERROR]", error);
    return res.status(error.statusCode || 400).json({
      message: error.message || "Server Error",
    });
  }
};

// REFRESH TOKEN
const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokenRotation(refreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      message: error.message || "Invalid Refresh Token",
    });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    if (req.user) {
      await authService.logoutUser(req.user._id);
    }
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

// GET CURRENT USER PROFILE
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

module.exports = {
  register,
  login,
  refreshTokenController,
  logout,
  getMe,
};
