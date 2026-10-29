const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);

module.exports = router;
