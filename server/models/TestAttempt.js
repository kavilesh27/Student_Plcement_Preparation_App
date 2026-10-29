const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    questionType: {
      type: String,
      default: 'mcq',
    },
    studentAnswer: {
      type: String,
      default: '',
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    maxMarks: {
      type: Number,
      default: 5,
    },
    evaluationFeedback: {
      conceptAccuracy: Number,
      technicalCorrectness: Number,
      clarityAndEfficiency: Number,
      missingPoints: [String],
      suggestedImprovements: String,
      sampleStrongAnswer: String,
      testCaseResults: [{
        input: String,
        expected: String,
        actual: String,
        passed: Boolean,
      }],
    },
  }],
  score: {
    type: Number,
    default: 0,
  },
  maximumScore: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  topicPerformance: [{
    topic: String,
    correct: Number,
    total: Number,
    percentage: Number,
  }],
  durationSeconds: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'timed_out'],
    default: 'completed',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  feedback: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Indexes for fast lookups & progress reporting
testAttemptSchema.index({ studentId: 1, submittedAt: -1 });
testAttemptSchema.index({ assessmentId: 1, studentId: 1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
