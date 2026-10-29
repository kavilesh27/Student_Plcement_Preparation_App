const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemType: {
    type: String,
    enum: ['Question', 'AI_Evaluation', 'Course_Material', 'Portal_Bug', 'General'],
    required: true,
  },
  itemId: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In_Review', 'Resolved'],
    default: 'Open',
  },
  adminStaffNotes: {
    type: String,
    default: '',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Feedback', feedbackSchema);
