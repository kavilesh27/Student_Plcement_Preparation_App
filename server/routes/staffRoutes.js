const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/dashboard', staffController.getStaffDashboard);
router.get('/students', staffController.getStudentRoster);
router.get('/students-needing-support', staffController.getStudentsNeedingSupport);
router.post('/assign-support', staffController.assignSupportIntervention);
router.get('/reports/export', staffController.exportReport);

module.exports = router;
