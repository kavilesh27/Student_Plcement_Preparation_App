const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
  },
  questionType: {
    type: String,
    enum: [
      'mcq',
      'output_prediction',
      'find_error',
      'debugging',
      'coding',
      'code_completion',
      'written_theory',
      'interview'
    ],
    default: 'mcq',
  },
  language: {
    type: String,
    enum: ['C', 'C++', 'Java', 'Python', 'General', 'Aptitude', 'Core CS'],
    default: 'General',
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  subtopic: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  options: [{
    id: String,
    text: String,
  }],
  correctAnswer: {
    type: String, // option ID for MCQ or expected code snippet / answer key
  },
  starterCode: {
    type: String,
    default: '',
  },
  solutionCode: {
    type: String,
    default: '',
  },
  codeSnippet: {
    type: String, // for output prediction or find error
    default: '',
  },
  testCases: [testCaseSchema],
  explanation: {
    type: String,
    default: '',
  },
  rubric: {
    conceptAccuracy: { type: Number, default: 40 },
    technicalCorrectness: { type: Number, default: 40 },
    clarityAndEfficiency: { type: Number, default: 20 },
  },
  marks: {
    type: Number,
    default: 5,
  },
  tags: [{ type: String }],
  sourceType: {
    type: String,
    enum: ['curated', 'ai_generated', 'user_feedback'],
    default: 'curated',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Question', questionSchema);
