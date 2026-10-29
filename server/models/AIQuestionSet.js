const mongoose = require('mongoose');

const aiQuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'Resume-based questions',
      'Project explanation',
      'Programming fundamentals',
      'Technical interview',
      'Problem-solving',
      'HR questions'
    ],
    default: 'Technical interview',
  },
  questionText: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  expectedAnswer: { type: String, default: '' },
  evaluationRubric: {
    conceptAccuracy: { type: Number, default: 40 },
    technicalCorrectness: { type: Number, default: 40 },
    clarityAndEfficiency: { type: Number, default: 20 },
  },
  maxMarks: { type: Number, default: 10 },
  studentAnswer: { type: String, default: '' },
  evaluation: {
    marksObtained: { type: Number, default: 0 },
    conceptAccuracy: { type: Number, default: 0 },
    technicalCorrectness: { type: Number, default: 0 },
    missingPoints: [{ type: String }],
    suggestedImprovements: { type: String, default: '' },
    sampleStrongAnswer: { type: String, default: '' },
  },
  isFlaggedAsIncorrect: { type: Boolean, default: false },
  flagFeedback: { type: String, default: '' },
}, { _id: true });

const aiQuestionSetSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  questions: [aiQuestionSchema],
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['generated', 'in_progress', 'evaluated'],
    default: 'generated',
  },
  adaptiveRecommendations: {
    recommendedTopics: [{ type: String }],
    practiceAdvice: { type: String, default: '' },
    recommendedCourses: [{ type: String }],
    suggestedCompanies: [{ type: String }],
  },
  generationMetadata: {
    model: { type: String, default: 'Gemini-1.5 / Intelligent Fallback Engine' },
    provider: { type: String, default: 'Internal NLP Service' },
    generatedAt: { type: Date, default: Date.now },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AIQuestionSet', aiQuestionSetSchema);
