const Feedback = require('../models/Feedback');

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback about questions, AI answers, course content, or bug
 * @access  Private
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { itemType, itemId, subject, description } = req.body;
    if (!itemType || !subject || !description) {
      return res.status(400).json({ success: false, message: 'Please provide item type, subject, and description.' });
    }

    const feedback = await Feedback.create({
      studentId: req.user._id,
      itemType,
      itemId: itemId || '',
      subject,
      description,
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for helping us improve!',
      data: feedback,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/feedback
 * @desc    Get feedback tickets (Staff / Admin)
 * @access  Private (Staff / Admin)
 */
exports.getFeedbackList = async (req, res) => {
  try {
    const list = await Feedback.find()
      .populate('studentId', 'name studentId email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
