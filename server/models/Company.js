const mongoose = require('mongoose');

const recruitmentRoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Aptitude', 'Coding', 'Technical Interview', 'HR Interview', 'Group Discussion', 'Assessment'],
    default: 'Assessment',
  },
  description: { type: String, default: '' },
  topics: [{ type: String }],
  timeLimitMinutes: { type: Number, default: 60 },
  practiceTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  materials: [{
    title: { type: String, required: true },
    url: { type: String, default: '' },
    type: { type: String, enum: ['document', 'video', 'cheatsheet', 'practice_link'], default: 'document' },
  }],
  prepPlanSummary: { type: String, default: '' }
}, { _id: true });

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60',
  },
  jobRoles: [{
    title: { type: String, required: true },
    packageLPA: { type: String, default: 'Competitive' },
    location: { type: String, default: 'Multiple Locations / Hybrid' },
    jobType: { type: String, default: 'Full-time' },
  }],
  description: {
    type: String,
    default: '',
  },
  driveDate: {
    type: Date,
    required: true,
  },
  registrationDeadline: {
    type: Date,
    required: true,
  },
  eligibilityCriteria: {
    minCGPA: { type: Number, default: 6.5 },
    allowedDepartments: [{ type: String }],
    graduationYears: [{ type: Number }],
    maxActiveBacklogs: { type: Number, default: 0 },
    maxHistoryBacklogs: { type: Number, default: 2 },
    requiredSkills: [{ type: String }],
    additionalCriteriaNotes: { type: String, default: 'Consistent 60%+ in 10th & 12th standards' },
  },
  recruitmentRounds: [recruitmentRoundSchema],
  requiredSkills: [{ type: String }],
  preparationMaterials: [{
    title: String,
    url: String,
    category: String,
  }],
  applicationUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'completed', 'archived'],
    default: 'published',
  },
  isDemoData: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Company', companySchema);
