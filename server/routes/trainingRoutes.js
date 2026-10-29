const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/courses', trainingController.getCourses);
router.get('/courses/:id', trainingController.getCourseById);
router.post('/courses/:id/lessons/:lessonId/complete', trainingController.markLessonComplete);

module.exports = router;
