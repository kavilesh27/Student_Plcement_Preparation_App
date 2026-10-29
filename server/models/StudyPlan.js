const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g., 'Monday', 'Tuesday'
  date: { type: String }, // '2026-10-30'
  title: { type: String, required: true },
  category: { type: String, default: 'Coding' },
  durationMinutes: { type: Number, default: 45 },
  isCompleted: { type: Boolean, default: false },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  relatedCompany: { type: String, default: '' },
  relatedTopic: { type: String, default: '' },
}, { _id: true });

const studyPlanSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStartDate: {
    type: String,
    required: true,
  },
  targetDrives: [{ type: String }],
  focusAreas: [{ type: String }],
  weeklyTargetHours: {
    type: Number,
    default: 10,
  },
  completedHours: {
    type: Number,
    default: 0,
  },
  tasks: [studyTaskSchema],
  aiNotes: {
    type: String,
    default: 'Personalized based on recent test gaps and upcoming target company requirements.',
  },
}, {
  timestamps: true,
});

studyPlanSchema.index({ studentId: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
