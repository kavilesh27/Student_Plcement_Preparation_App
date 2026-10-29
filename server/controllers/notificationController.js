const Notification = require('../models/Notification');

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    if (req.params.id === 'mark-all') {
      await Notification.updateMany(
        { recipientId: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
