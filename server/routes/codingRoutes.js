const express = require('express');
const router = express.Router();
const codingController = require('../controllers/codingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/problems', codingController.getCodingProblems);
router.get('/problems/:id', codingController.getProblemById);
router.post('/submit', authorize('student'), codingController.submitSolution);
router.get('/submissions', codingController.getSubmissions);

module.exports = router;
