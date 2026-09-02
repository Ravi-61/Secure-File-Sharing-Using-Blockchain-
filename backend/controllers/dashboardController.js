const File = require("../models/File");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const SecurityLog = require("../models/SecurityLog");
const ShareLink = require("../models/ShareLink");

// USER DASHBOARD STATS
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFiles = await File.find({ user: userId }).sort({ createdAt: -1 });
    const totalFiles = userFiles.length;
    const totalSize = userFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const encryptedFiles = userFiles.filter((f) => f.isEncrypted).length;
    const onChainFiles = userFiles.filter((f) => f.isOnChain).length;

    const activeShareLinks = await ShareLink.countDocuments({
      createdBy: userId,
      isActive: true,
    });

    const recentUploads = userFiles.slice(0, 5);

    return res.status(200).json({
      summary: {
        totalFiles,
        totalSizeBytes: totalSize,
        totalSizeFormatted: (totalSize / (1024 * 1024)).toFixed(2) + " MB",
        encryptedFiles,
        onChainFiles,
        activeShareLinks,
      },
      recentFiles: recentUploads,
    });
  } catch (error) {
    console.error("[USER DASHBOARD ERROR]", error);
    return res.status(500).json({ message: "Failed to fetch user dashboard data" });
  }
};

// ADMIN DASHBOARD STATS
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const userRoleCount = await User.countDocuments({ role: "User" });
    const adminRoleCount = await User.countDocuments({ role: "Admin" });
    const auditorRoleCount = await User.countDocuments({ role: "Auditor" });

    const totalSystemFiles = await File.countDocuments();
    const allFiles = await File.find({});
    const totalStorageBytes = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);

    const totalSecurityThreats = await SecurityLog.countDocuments();
    const recentAuditLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(10);

    return res.status(200).json({
      userStats: {
        totalUsers,
        users: userRoleCount,
        admins: adminRoleCount,
        auditors: auditorRoleCount,
      },
      storageStats: {
        totalFiles: totalSystemFiles,
        totalSizeBytes: totalStorageBytes,
        totalSizeFormatted: (totalStorageBytes / (1024 * 1024)).toFixed(2) + " MB",
      },
      securityStats: {
        totalThreatsLogged: totalSecurityThreats,
      },
      recentLogs: recentAuditLogs,
    });
  } catch (error) {
    console.error("[ADMIN DASHBOARD ERROR]", error);
    return res.status(500).json({ message: "Failed to fetch admin dashboard data" });
  }
};

// AUDITOR DASHBOARD STATS
const getAuditorDashboard = async (req, res) => {
  try {
    const securityLogs = await SecurityLog.find({}).sort({ createdAt: -1 }).limit(20);
    const auditLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(20);

    const integrityChecksCount = await AuditLog.countDocuments({ action: "FILE_VERIFIED" });
    const failedVerifications = await AuditLog.countDocuments({
      action: "FILE_VERIFIED",
      status: "FAILED",
    });

    return res.status(200).json({
      integritySummary: {
        totalIntegrityChecks: integrityChecksCount,
        failedVerifications,
        integrityRate:
          integrityChecksCount > 0
            ? (((integrityChecksCount - failedVerifications) / integrityChecksCount) * 100).toFixed(1) + "%"
            : "100%",
      },
      securityThreats: securityLogs,
      systemAuditTrail: auditLogs,
    });
  } catch (error) {
    console.error("[AUDITOR DASHBOARD ERROR]", error);
    return res.status(500).json({ message: "Failed to fetch auditor dashboard data" });
  }
};

module.exports = {
  getUserDashboard,
  getAdminDashboard,
  getAuditorDashboard,
};
