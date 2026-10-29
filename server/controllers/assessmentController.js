const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const User = require('../models/User');
const codingRunner = require('../services/coding/runner');
const { recordAuditLog } = require('../middleware/audit');

/**
 * @route   GET /api/assessments
 * @desc    Get all assessments (with filters: daily, language, type)
 * @access  Private
 */
exports.getAssessments = async (req, res) => {
  try {
    const { type, language, isDailyTest, status } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (type) query.type = type;
    if (language && language !== 'All') query.programmingLanguage = language;
    if (isDailyTest !== undefined) query.isDailyTest = isDailyTest === 'true';

    const assessments = await Assessment.find(query)
      .populate('questions', 'topic difficulty marks questionType language')
      .populate('companyId', 'name logo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/assessments/:id
 * @desc    Get assessment for taking.
 *          SECURITY: If role is student and not submitted, strip correctAnswer and explanations!
 * @access  Private
 */
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('questions')
      .populate('companyId', 'name logo');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Check if student already completed this assessment
    const existingAttempt = await TestAttempt.findOne({
      assessmentId: assessment._id,
      studentId: req.user._id,
      status: 'completed',
    }).sort({ submittedAt: -1 });

    const assessmentObj = assessment.toObject();

    // If user is student and hasn't completed or this is an active test, strip secrets!
    if (req.user.role === 'student' && !existingAttempt) {
      assessmentObj.questions = assessmentObj.questions.map(q => {
        const cleanQ = { ...q };
        delete cleanQ.correctAnswer;
        delete cleanQ.solutionCode;
        delete cleanQ.explanation;
        // Keep only non-hidden test cases for coding
        if (cleanQ.testCases) {
          cleanQ.testCases = cleanQ.testCases.filter(tc => !tc.isHidden);
        }
        return cleanQ;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        assessment: assessmentObj,
        previousAttempt: existingAttempt || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/assessments/:id/submit
 * @desc    Submit student assessment answers & automatically evaluate
 * @access  Private (Student)
 */
exports.submitAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('questions');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const { answers = [], durationSeconds = 900 } = req.body;
    // answers: [{ questionId, studentAnswer }]

    let totalScore = 0;
    let maximumScore = 0;
    const evaluatedAnswers = [];
    const topicStats = {};

    for (const q of assessment.questions) {
      const qIdStr = q._id.toString();
      const submitted = answers.find(a => a.questionId?.toString() === qIdStr);
      const studentAns = (submitted?.studentAnswer || '').trim();
      const maxMarks = q.marks || 5;
      maximumScore += maxMarks;

      let isCorrect = false;
      let marksAwarded = 0;
      let feedback = {};

      if (['mcq', 'output_prediction', 'find_error'].includes(q.questionType)) {
        // Strict or normalized comparison for objective questions
        if (studentAns && studentAns.toLowerCase() === (q.correctAnswer || '').trim().toLowerCase()) {
          isCorrect = true;
          marksAwarded = maxMarks;
        } else {
          isCorrect = false;
          marksAwarded = 0;
        }
        feedback = {
          expectedAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        };
      } else if (['coding', 'debugging', 'code_completion'].includes(q.questionType)) {
        // Evaluate via coding sandbox runner
        const runRes = await codingRunner.evaluate({
          language: q.language || 'C',
          code: studentAns,
          testCases: q.testCases || [{ input: '', expectedOutput: '1' }],
        });

        isCorrect = runRes.status === 'Accepted';
        const fraction = runRes.totalTestCases > 0 ? runRes.testCasesPassed / runRes.totalTestCases : 0;
        marksAwarded = Math.round(fraction * maxMarks);
        feedback = {
          evaluationMode: runRes.evaluationMode,
          testCaseResults: runRes.testCaseDetails,
          errorMessage: runRes.errorMessage,
          sampleSolution: q.solutionCode || '',
          explanation: q.explanation || '',
        };
      } else {
        // Written theory question fallback rubric
        const wordCount = studentAns.split(/\s+/).length;
        if (wordCount > 15) {
          marksAwarded = Math.round(maxMarks * 0.8);
          isCorrect = true;
        } else if (wordCount > 5) {
          marksAwarded = Math.round(maxMarks * 0.5);
          isCorrect = false;
        } else {
          marksAwarded = 0;
          isCorrect = false;
        }
      }

      totalScore += marksAwarded;

      // Track topic performance
      const topicName = q.topic || 'General Programming';
      if (!topicStats[topicName]) {
        topicStats[topicName] = { correct: 0, total: 0 };
      }
      topicStats[topicName].total += 1;
      if (isCorrect) topicStats[topicName].correct += 1;

      evaluatedAnswers.push({
        questionId: q._id,
        questionType: q.questionType,
        studentAnswer: studentAns,
        isCorrect,
        marksAwarded,
        maxMarks,
        evaluationFeedback: feedback,
      });
    }

    const percentage = maximumScore > 0 ? Math.round((totalScore / maximumScore) * 100) : 0;
    const passed = percentage >= (assessment.passingPercentage || 60);

    const topicPerformance = Object.keys(topicStats).map(topic => ({
      topic,
      correct: topicStats[topic].correct,
      total: topicStats[topic].total,
      percentage: Math.round((topicStats[topic].correct / topicStats[topic].total) * 100),
    }));

    const attempt = await TestAttempt.create({
      studentId: req.user._id,
      assessmentId: assessment._id,
      answers: evaluatedAnswers,
      score: totalScore,
      maximumScore,
      percentage,
      passed,
      topicPerformance,
      durationSeconds,
      status: 'completed',
      submittedAt: new Date(),
      feedback: passed
        ? 'Great performance! You met the passing cutoff for this placement assessment.'
        : 'Assessment needs improvement. Review the topic breakdown and try practice questions.',
    });

    // Update student active date & badges if streak increases
    const user = await User.findById(req.user._id);
    if (user) {
      user.lastActiveDate = new Date();
      if (attempt.percentage >= 90 && !user.badges.some(b => b.id === 'high_scorer')) {
        user.badges.push({
          id: 'high_scorer',
          title: 'Placement Ace',
          icon: 'Award',
          description: 'Achieved 90%+ on a placement assessment',
          earnedAt: new Date(),
        });
      }
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Assessment submitted and evaluated successfully.',
      data: {
        attemptId: attempt._id,
        score: totalScore,
        maximumScore,
        percentage,
        passed,
        topicPerformance,
        evaluatedAnswers,
        feedback: attempt.feedback,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/assessments
 * @desc    Create a new assessment with questions
 * @access  Private (Staff / Admin)
 */
exports.createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      programmingLanguage,
      topics,
      difficulty,
      durationMinutes,
      passingPercentage,
      questions,
      companyId,
      isDailyTest,
    } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide test title and at least one question.' });
    }

    // Insert or resolve questions
    const questionIds = [];
    for (const q of questions) {
      if (q._id) {
        questionIds.push(q._id);
      } else {
        const newQ = await Question.create({
          ...q,
          createdBy: req.user._id,
        });
        questionIds.push(newQ._id);
      }
    }

    const assessment = await Assessment.create({
      title,
      description: description || '',
      type: type || 'daily_test',
      programmingLanguage: programmingLanguage || 'Mixed',
      topics: topics || ['Programming Fundamentals'],
      difficulty: difficulty || 'Intermediate',
      durationMinutes: durationMinutes || 30,
      passingPercentage: passingPercentage || 60,
      questions: questionIds,
      companyId: companyId || null,
      isDailyTest: !!isDailyTest,
      assignedBy: req.user._id,
      status: 'published',
    });

    await recordAuditLog({
      actor: req.user,
      action: 'Created Assessment Test',
      targetType: 'Assessment',
      targetId: assessment._id,
      metadata: { title: assessment.title, questionCount: questionIds.length },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully.',
      data: assessment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
