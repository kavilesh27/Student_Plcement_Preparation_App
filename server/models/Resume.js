const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileMetadata: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
  },
  extractedText: {
    type: String,
    default: '',
  },
  extractedSkills: {
    programmingLanguages: [{ type: String }],
    frameworks: [{ type: String }],
    databases: [{ type: String }],
    cloudAndTools: [{ type: String }],
    coreCS: [{ type: String }],
    softSkills: [{ type: String }],
  },
  projects: [{
    title: String,
    techStack: [{ type: String }],
    description: String,
    highlights: [{ type: String }],
  }],
  internships: [{
    company: String,
    role: String,
    duration: String,
    description: String,
  }],
  certifications: [{ type: String }],
  education: [{
    institution: String,
    degree: String,
    year: String,
    score: String,
  }],
  analysisResults: {
    resumeCompletenessScore: { type: Number, default: 75 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    atsSuggestions: [{ type: String }],
    missingKeywords: [{ type: String }],
  },
  version: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

resumeSchema.index({ studentId: 1, version: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
