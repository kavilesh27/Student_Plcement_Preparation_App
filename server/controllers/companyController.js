const Company = require('../models/Company');
const CompanyEligibility = require('../models/CompanyEligibility');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { recordAuditLog } = require('../middleware/audit');

/**
 * @route   GET /api/companies
 * @desc    Get all company drives (filterable)
 * @access  Private
 */
exports.getCompanies = async (req, res) => {
  try {
    const { status, department, search } = req.query;
    const query = {};

    // Students only see published drives
    if (req.user.role === 'student') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'jobRoles.title': { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.$or = [
        { 'eligibilityCriteria.allowedDepartments': department },
        { 'eligibilityCriteria.allowedDepartments': 'All' },
        { 'eligibilityCriteria.allowedDepartments': { $size: 0 } },
      ];
    }

    const companies = await Company.find(query).sort({ driveDate: 1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/companies/:id
 * @desc    Get single company drive with full round configuration
 * @access  Private
 */
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company drive not found' });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/companies
 * @desc    Create new recruitment drive
 * @access  Private (Staff / Admin)
 */
exports.createCompany = async (req, res) => {
  try {
    const {
      name,
      logo,
      jobRoles,
      description,
      driveDate,
      registrationDeadline,
      eligibilityCriteria,
      recruitmentRounds,
      requiredSkills,
      preparationMaterials,
      applicationUrl,
      status,
    } = req.body;

    if (!name || !driveDate || !registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, recruitment drive date, and registration deadline.',
      });
    }

    const company = await Company.create({
      name,
      logo: logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60',
      jobRoles: jobRoles || [{ title: 'Graduate Engineer Trainee', packageLPA: '6.5 - 9.0 LPA' }],
      description: description || '',
      driveDate,
      registrationDeadline,
      eligibilityCriteria: eligibilityCriteria || {
        minCGPA: 6.5,
        allowedDepartments: ['Computer Science and Engineering', 'Information Technology'],
        graduationYears: [2026],
        maxActiveBacklogs: 0,
      },
      recruitmentRounds: recruitmentRounds || [
        { roundNumber: 1, name: 'Online Aptitude & Coding Test', type: 'Assessment', timeLimitMinutes: 90, topics: ['Quantitative', 'Logical', 'DSA'] },
        { roundNumber: 2, name: 'Technical Interview', type: 'Technical Interview', timeLimitMinutes: 45, topics: ['Projects', 'OOP', 'DBMS'] },
        { roundNumber: 3, name: 'HR Interview', type: 'HR Interview', timeLimitMinutes: 30, topics: ['Behavioral', 'Communication'] },
      ],
      requiredSkills: requiredSkills || ['Data Structures', 'Java', 'Problem Solving'],
      preparationMaterials: preparationMaterials || [],
      applicationUrl: applicationUrl || '',
      status: status || 'published',
      createdBy: req.user._id,
    });

    // Notify all students about the new recruitment drive
    const students = await User.find({ role: 'student', accountStatus: 'active' }).select('_id');
    const notifications = students.map(s => ({
      recipientId: s._id,
      title: `New Recruitment Drive: ${company.name}`,
      message: `${company.name} has announced a campus drive scheduled on ${new Date(company.driveDate).toLocaleDateString()}. Check eligibility and start preparation now!`,
      notificationType: 'company_drive',
      link: `/student/companies/${company._id}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await recordAuditLog({
      actor: req.user,
      action: 'Created Company Recruitment Drive',
      targetType: 'Company',
      targetId: company._id,
      metadata: { companyName: company.name, driveDate },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Company recruitment drive created successfully.',
      data: company,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   PUT /api/companies/:id
 * @desc    Update company drive details or recruitment rounds
 * @access  Private (Staff / Admin)
 */
exports.updateCompany = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Re-evaluate eligibility records when requirements change
    await CompanyEligibility.deleteMany({ companyId: company._id });

    await recordAuditLog({
      actor: req.user,
      action: 'Updated Company Recruitment Drive',
      targetType: 'Company',
      targetId: company._id,
      metadata: { companyName: company.name, updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Recruitment drive updated successfully.',
      data: company,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   DELETE /api/companies/:id
 * @desc    Delete or archive company drive
 * @access  Private (Staff / Admin)
 */
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    await Company.findByIdAndDelete(req.params.id);
    await CompanyEligibility.deleteMany({ companyId: req.params.id });

    await recordAuditLog({
      actor: req.user,
      action: 'Deleted Company Recruitment Drive',
      targetType: 'Company',
      targetId: req.params.id,
      metadata: { companyName: company.name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Recruitment drive deleted successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
