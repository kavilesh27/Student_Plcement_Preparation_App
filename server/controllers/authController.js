const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { recordAuditLog } = require('../middleware/audit');

// Generate JWT token
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      academicYear: user.academicYear,
      semester: user.semester,
      graduationYear: user.graduationYear,
      CGPA: user.CGPA,
      backlogStatus: user.backlogStatus,
      activeBacklogsCount: user.activeBacklogsCount,
      phoneNumber: user.phoneNumber,
      profileDetails: user.profileDetails,
      accountStatus: user.accountStatus,
      currentStreak: user.currentStreak,
      badges: user.badges,
    },
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const {
      name,
      studentId,
      email,
      password,
      department,
      academicYear,
      semester,
      CGPA,
      graduationYear,
      phoneNumber,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      studentId: studentId || `STU${Date.now().toString().slice(-6)}`,
      email: email.toLowerCase(),
      passwordHash,
      role: 'student', // Self-registration defaults to student role
      department: department || 'Computer Science and Engineering',
      academicYear: academicYear || '4th Year',
      semester: Number(semester) || 7,
      CGPA: Number(CGPA) || 7.5,
      graduationYear: Number(graduationYear) || 2026,
      phoneNumber: phoneNumber || '',
      profileDetails: {
        skills: ['C', 'Java', 'Data Structures', 'SQL'],
        targetCompanies: ['TCS', 'Zoho', 'Infosys'],
      },
      currentStreak: 1,
      badges: [{
        id: 'newbie',
        title: 'Placement Journey Begun',
        icon: 'Rocket',
        description: 'Successfully registered on the placement preparation portal.',
        earnedAt: new Date(),
      }],
    });

    // Create a welcoming notification
    await Notification.create({
      recipientId: user._id,
      title: 'Welcome to PlacementPrep AI!',
      message: 'Explore upcoming recruitment drives, take your daily programming test, and upload your resume for AI analysis.',
      notificationType: 'system',
    });

    await recordAuditLog({
      actor: user,
      action: 'Student Self-Registration',
      targetType: 'User',
      targetId: user._id,
      ipAddress: req.ip,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { loginIdentifier, email, password } = req.body;
    const identifier = (loginIdentifier || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/student ID and password.' });
    }

    // Support login via email or student ID
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { studentId: identifier.toUpperCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    if (user.accountStatus === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is currently inactive. Contact administrator.' });
    }

    // Update streak if student
    if (user.role === 'student') {
      const now = new Date();
      const last = new Date(user.lastActiveDate || now);
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.currentStreak = (user.currentStreak || 1) + 1;
        if (user.currentStreak > (user.longestStreak || 1)) {
          user.longestStreak = user.currentStreak;
        }
      } else if (diffDays > 1) {
        user.currentStreak = 1;
      }
      user.lastActiveDate = now;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user profile
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const unreadNotifications = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      user,
      unreadNotifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile details
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    const allowed = ['name', 'phoneNumber', 'profileDetails', 'CGPA', 'backlogStatus', 'activeBacklogsCount'];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
