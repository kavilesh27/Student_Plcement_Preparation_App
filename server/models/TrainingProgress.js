const mongoose = require('mongoose');

const trainingProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingCourse',
    required: true,
  },
  completedModules: [{
    moduleId: mongoose.Schema.Types.ObjectId,
    completedAt: { type: Date, default: Date.now },
  }],
  completedLessons: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    completedAt: { type: Date, default: Date.now },
  }],
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  assessmentResults: [{
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    score: Number,
    percentage: Number,
    passed: Boolean,
  }],
}, {
  timestamps: true,
});

trainingProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('TrainingProgress', trainingProgressSchema);
