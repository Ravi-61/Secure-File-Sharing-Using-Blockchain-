const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === "all") {
      await Notification.updateMany({ user: req.user._id }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    return res.status(200).json({ message: "Notification updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
