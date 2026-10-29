const mongoose = require('mongoose');

const companyEligibilitySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  eligibilityStatus: {
    type: String,
    enum: [
      'Eligible based on recorded criteria',
      'Not eligible',
      'Needs verification'
    ],
    default: 'Needs verification',
  },
  overallEligible: {
    type: Boolean,
    default: false,
  },
  criteriaResults: {
    cgpa: {
      required: Number,
      actual: Number,
      status: { type: String, enum: ['Met', 'Not Met', 'Needs Verification'] },
      reason: String,
    },
    department: {
      allowed: [{ type: String }],
      actual: String,
      status: { type: String, enum: ['Met', 'Not Met', 'Needs Verification'] },
      reason: String,
    },
    graduationYear: {
      allowed: [{ type: Number }],
      actual: Number,
      status: { type: String, enum: ['Met', 'Not Met', 'Needs Verification'] },
      reason: String,
    },
    backlogs: {
      maxAllowed: Number,
      actual: Number,
      status: { type: String, enum: ['Met', 'Not Met', 'Needs Verification'] },
      reason: String,
    },
    skills: {
      required: [{ type: String }],
      matched: [{ type: String }],
      missing: [{ type: String }],
      status: { type: String, enum: ['Met', 'Partially Met', 'Needs Verification'] },
      reason: String,
    },
  },
  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
  disclaimer: {
    type: String,
    default: 'Meeting recorded criteria does not guarantee interview shortlisting or job offer. Official company decisions depend on live drive policies and verification.',
  },
}, {
  timestamps: true,
});

companyEligibilitySchema.index({ studentId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('CompanyEligibility', companyEligibilitySchema);
