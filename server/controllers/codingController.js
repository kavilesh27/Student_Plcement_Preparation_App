const Question = require('../models/Question');
const CodingSubmission = require('../models/CodingSubmission');
const codingRunner = require('../services/coding/runner');

/**
 * @route   GET /api/coding/problems
 * @desc    Get coding problems (filter by language, topic, difficulty)
 * @access  Private
 */
exports.getCodingProblems = async (req, res) => {
  try {
    const { language, topic, difficulty } = req.query;
    const query = {
      questionType: { $in: ['coding', 'debugging', 'code_completion', 'output_prediction', 'find_error'] },
    };

    if (language && language !== 'All') query.language = language;
    if (topic && topic !== 'All') query.topic = topic;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;

    const problems = await Question.find(query)
      .select('-solutionCode -correctAnswer')
      .sort({ createdAt: -1 });

    // Attach student submission status for each problem
    const problemIds = problems.map(p => p._id);
    const userSubmissions = await CodingSubmission.find({
      studentId: req.user._id,
      problemId: { $in: problemIds },
    });

    const problemsWithStatus = problems.map(prob => {
      const pObj = prob.toObject();
      const subs = userSubmissions.filter(s => s.problemId.toString() === prob._id.toString());
      const hasAccepted = subs.some(s => s.status === 'Accepted');
      pObj.submissionStatus = hasAccepted ? 'Solved' : (subs.length > 0 ? 'Attempted' : 'Unsolved');
      pObj.attemptsCount = subs.length;
      return pObj;
    });

    res.status(200).json({
      success: true,
      count: problemsWithStatus.length,
      data: problemsWithStatus,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/coding/problems/:id
 * @desc    Get single problem with starter code & test cases
 * @access  Private
 */
exports.getProblemById = async (req, res) => {
  try {
    const problem = await Question.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Coding problem not found' });
    }

    const problemObj = problem.toObject();
    // Exclude solution code for students
    if (req.user.role === 'student') {
      delete problemObj.solutionCode;
      delete problemObj.correctAnswer;
      // Show only visible test cases
      if (problemObj.testCases) {
        problemObj.testCases = problemObj.testCases.filter(tc => !tc.isHidden);
      }
    }

    // Get student past submissions for this problem
    const pastSubmissions = await CodingSubmission.find({
      studentId: req.user._id,
      problemId: problem._id,
    }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        problem: problemObj,
        pastSubmissions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/coding/submit
 * @desc    Submit code solution for execution & testing
 * @access  Private (Student)
 */
exports.submitSolution = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({ success: false, message: 'Problem ID and code are required.' });
    }

    const problem = await Question.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Evaluate code via secure runner (remote sandbox or transparent safe mock mode)
    const runResult = await codingRunner.evaluate({
      language: language || problem.language || 'C',
      code,
      testCases: problem.testCases || [{ input: '', expectedOutput: '1' }],
    });

    const submission = await CodingSubmission.create({
      studentId: req.user._id,
      problemId: problem._id,
      language: language || problem.language,
      submittedCode: code,
      status: runResult.status,
      executionTimeMs: runResult.executionTimeMs,
      memoryKb: runResult.memoryKb,
      testCasesPassed: runResult.testCasesPassed,
      totalTestCases: runResult.totalTestCases,
      testCaseDetails: runResult.testCaseDetails,
      evaluationMode: runResult.evaluationMode,
      errorMessage: runResult.errorMessage || '',
    });

    res.status(200).json({
      success: true,
      message: `Submission evaluated: ${runResult.status}`,
      data: submission,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/coding/submissions
 * @desc    Get current student's coding submissions history
 * @access  Private
 */
exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await CodingSubmission.find({ studentId: req.user._id })
      .populate('problemId', 'questionText language topic difficulty')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
