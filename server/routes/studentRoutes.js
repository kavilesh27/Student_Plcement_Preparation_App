const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', studentController.getDashboardSummary);
router.get('/readiness', studentController.getPlacementReadiness);
router.get('/company-drives', studentController.getCompanyDrives);
router.get('/company-drives/:id/prep', studentController.getCompanyPreparation);
router.get('/test-history', studentController.getTestHistory);
router.get('/study-plan', studentController.getStudyPlan);
router.put('/study-plan/tasks/:taskId', studentController.toggleStudyPlanTask);

module.exports = router;
