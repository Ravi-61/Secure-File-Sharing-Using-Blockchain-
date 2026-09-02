const User = require("../models/User");
const File = require("../models/File");
const AuditLog = require("../models/AuditLog");
const SecurityLog = require("../models/SecurityLog");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Update user role or status
const updateUserRoleOrStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role && ["User", "Admin", "Auditor"].includes(role)) {
      user.role = role;
    }

    if (status && ["active", "suspended", "pending"].includes(status)) {
      user.status = status;
    }

    await user.save();

    await AuditLog.create({
      action: "ADMIN_UPDATED_USER",
      user: req.user._id,
      userEmail: req.user.email,
      details: { targetUserId: userId, updatedRole: user.role, updatedStatus: user.status },
    });

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user" });
  }
};

// Get Audit Logs (for Admin & Auditor)
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ logs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

// Get Security & IDS Logs
const getSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find({}).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ logs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch security logs" });
  }
};

// Get All System Files (Admin view)
const getAllSystemFiles = async (req, res) => {
  try {
    const files = await File.find({}).sort({ createdAt: -1 }).populate("user", "username email role");
    return res.status(200).json({ files });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch system files" });
  }
};

module.exports = {
  getAllUsers,
  updateUserRoleOrStatus,
  getAuditLogs,
  getSecurityLogs,
  getAllSystemFiles,
};
