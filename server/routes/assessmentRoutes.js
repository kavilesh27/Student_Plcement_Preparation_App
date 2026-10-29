const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', assessmentController.getAssessments);
router.get('/:id', assessmentController.getAssessmentById);
router.post('/:id/submit', authorize('student'), assessmentController.submitAssessment);

// Staff and Admin can create assessments
router.post('/', authorize('staff', 'admin'), assessmentController.createAssessment);

module.exports = router;
