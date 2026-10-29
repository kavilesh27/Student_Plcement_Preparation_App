const TrainingCourse = require('../models/TrainingCourse');
const TrainingProgress = require('../models/TrainingProgress');

/**
 * @route   GET /api/training/courses
 * @desc    Get training courses by category or difficulty
 * @access  Private
 */
exports.getCourses = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const query = { status: 'active' };

    if (category && category !== 'All') query.category = category;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await TrainingCourse.find(query).sort({ title: 1 });

    // Attach student progress
    const courseIds = courses.map(c => c._id);
    const progressList = await TrainingProgress.find({
      studentId: req.user._id,
      courseId: { $in: courseIds },
    });

    const enriched = courses.map(c => {
      const p = progressList.find(prog => prog.courseId.toString() === c._id.toString());
      return {
        ...c.toObject(),
        progressPercentage: p ? p.completionPercentage : 0,
        isCompleted: p ? p.isCompleted : false,
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/training/courses/:id
 * @desc    Get course curriculum with lessons & progress
 * @access  Private
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await TrainingCourse.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Training course not found' });
    }

    let progress = await TrainingProgress.findOne({
      studentId: req.user._id,
      courseId: course._id,
    });

    if (!progress && req.user.role === 'student') {
      progress = await TrainingProgress.create({
        studentId: req.user._id,
        courseId: course._id,
        completionPercentage: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        course,
        progress: progress || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/training/courses/:id/lessons/:lessonId/complete
 * @desc    Mark a course lesson complete and recalculate completion percentage
 * @access  Private (Student)
 */
exports.markLessonComplete = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const course = await TrainingCourse.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let progress = await TrainingProgress.findOne({
      studentId: req.user._id,
      courseId: course._id,
    });

    if (!progress) {
      progress = new TrainingProgress({
        studentId: req.user._id,
        courseId: course._id,
        completedLessons: [],
      });
    }

    // Check if already completed
    const alreadyCompleted = progress.completedLessons.some(l => l.lessonId?.toString() === lessonId);
    if (!alreadyCompleted) {
      progress.completedLessons.push({ lessonId, completedAt: new Date() });
    }

    // Calculate total lessons in course
    let totalLessonsCount = 0;
    course.modules.forEach(m => {
      totalLessonsCount += (m.lessons || []).length;
    });

    if (totalLessonsCount > 0) {
      progress.completionPercentage = Math.min(100, Math.round((progress.completedLessons.length / totalLessonsCount) * 100));
      progress.isCompleted = progress.completionPercentage === 100;
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed.',
      data: progress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
