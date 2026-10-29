const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  actorName: {
    type: String,
    default: 'System',
  },
  actorRole: {
    type: String,
    default: 'system',
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    required: true, // e.g. User, Company, Assessment, Eligibility, TrainingCourse
  },
  targetId: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
