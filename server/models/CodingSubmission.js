const mongoose = require('mongoose');

const codingSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  language: {
    type: String,
    enum: ['C', 'C++', 'Java', 'Python'],
    required: true,
  },
  submittedCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'],
    default: 'Wrong Answer',
  },
  executionTimeMs: {
    type: Number,
    default: 0,
  },
  memoryKb: {
    type: Number,
    default: 0,
  },
  testCasesPassed: {
    type: Number,
    default: 0,
  },
  totalTestCases: {
    type: Number,
    default: 0,
  },
  testCaseDetails: [{
    testCaseNumber: Number,
    passed: Boolean,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    error: String,
  }],
  evaluationMode: {
    type: String,
    default: 'Local Test Runner Mock Mode',
  },
  errorMessage: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

codingSubmissionSchema.index({ studentId: 1, problemId: 1, createdAt: -1 });

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);
