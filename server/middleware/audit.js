const AuditLog = require('../models/AuditLog');

/**
 * Helper to record administrative & crucial system actions
 */
const recordAuditLog = async ({ actor, action, targetType, targetId, metadata, ipAddress }) => {
  try {
    await AuditLog.create({
      actorId: actor?._id,
      actorName: actor?.name || 'System',
      actorRole: actor?.role || 'system',
      action,
      targetType,
      targetId: targetId ? String(targetId) : '',
      metadata: metadata || {},
      ipAddress: ipAddress || '',
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};

module.exports = { recordAuditLog };
