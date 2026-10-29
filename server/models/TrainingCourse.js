const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  durationMinutes: { type: Number, default: 20 },
  videoUrl: { type: String, default: '' },
  keyTakeaways: [{ type: String }],
  resources: [{
    title: String,
    url: String,
  }],
}, { _id: true });

const courseModuleSchema = new mongoose.Schema({
  moduleNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  lessons: [lessonSchema],
  practiceQuizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
  },
}, { _id: true });

const trainingCourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability',
      'C Programming',
      'C++ Programming',
      'Java Programming',
      'Data Structures & Algorithms',
      'OOP Concepts',
      'DBMS & SQL',
      'Operating Systems',
      'Computer Networks',
      'Software Engineering',
      'Web Development',
      'Resume Building',
      'Technical Interview',
      'HR Interview'
    ],
  },
  description: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  estimatedDurationHours: {
    type: Number,
    default: 10,
  },
  learningObjectives: [{ type: String }],
  modules: [courseModuleSchema],
  isMandatory: {
    type: Boolean,
    default: false,
  },
  targetWeaknessTopics: [{ type: String }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TrainingCourse', trainingCourseSchema);
