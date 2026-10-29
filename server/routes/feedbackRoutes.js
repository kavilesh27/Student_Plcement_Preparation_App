const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', feedbackController.submitFeedback);
router.get('/', authorize('staff', 'admin'), feedbackController.getFeedbackList);

module.exports = router;
