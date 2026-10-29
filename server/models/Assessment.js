const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: [
      'daily_test',
      'company_prep',
      'mock_drive',
      'ai_resume_assessment',
      'remedial',
      'topic_practice'
    ],
    default: 'daily_test',
  },
  programmingLanguage: {
    type: String,
    enum: ['C', 'C++', 'Java', 'Python', 'Aptitude', 'Core CS', 'Mixed'],
    default: 'Mixed',
  },
  topics: [{ type: String }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
    default: 'Intermediate',
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  durationMinutes: {
    type: Number,
    default: 30,
  },
  passingPercentage: {
    type: Number,
    default: 60,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  targetDepartments: [{ type: String }],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  roundNumber: {
    type: Number,
  },
  isDailyTest: {
    type: Boolean,
    default: false,
  },
  scheduledDate: {
    type: Date,
  },
  deadline: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assessment', assessmentSchema);
