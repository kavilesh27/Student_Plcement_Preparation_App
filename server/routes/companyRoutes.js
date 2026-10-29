const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);

// Staff and Admin permissions for managing drives
router.post('/', authorize('staff', 'admin'), companyController.createCompany);
router.put('/:id', authorize('staff', 'admin'), companyController.updateCompany);
router.delete('/:id', authorize('staff', 'admin'), companyController.deleteCompany);

module.exports = router;
