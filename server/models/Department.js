const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
  },
  code: {
    type: String,
    required: [true, 'Department code is required (e.g., CSE, ECE)'],
    trim: true,
    uppercase: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  hodName: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Department', departmentSchema);
