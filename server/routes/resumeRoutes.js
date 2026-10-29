const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('student'));

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/active', resumeController.getActiveResume);
router.put('/:id/confirm-skills', resumeController.confirmSkills);
router.post('/:id/generate-questions', resumeController.generateQuestions);
router.post('/question-sets/:id/submit', resumeController.submitAIAssessment);
router.put('/questions/:qId/flag', resumeController.flagQuestion);

module.exports = router;
