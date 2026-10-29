const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student',
  },
  studentId: {
    type: String,
    trim: true,
    sparse: true,
  },
  department: {
    type: String,
    default: 'Computer Science and Engineering',
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  academicYear: {
    type: String,
    default: '4th Year',
  },
  semester: {
    type: Number,
    default: 7,
  },
  graduationYear: {
    type: Number,
    default: 2026,
  },
  CGPA: {
    type: Number,
    min: 0,
    max: 10,
    default: 7.5,
  },
  backlogStatus: {
    type: String,
    enum: ['No Backlogs', 'Active Backlogs', 'Cleared Backlogs', 'Pending Verification'],
    default: 'No Backlogs',
  },
  activeBacklogsCount: {
    type: Number,
    default: 0,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  profileDetails: {
    bio: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    skills: [{ type: String }],
    targetCompanies: [{ type: String }],
    achievements: [{ title: String, date: String, description: String }],
  },
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'pending_approval'],
    default: 'active',
  },
  currentStreak: {
    type: Number,
    default: 1,
  },
  longestStreak: {
    type: Number,
    default: 1,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  badges: [{
    id: String,
    title: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
    description: String,
  }],
}, {
  timestamps: true,
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Remove sensitive hash when serializing to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
