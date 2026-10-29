const Resume = require('../models/Resume');
const AIQuestionSet = require('../models/AIQuestionSet');
const resumeParser = require('../services/resume/resumeParser');
const aiService = require('../services/ai/aiService');
const { recordAuditLog } = require('../middleware/audit');

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload student resume (PDF/DOCX) & run automated skill & project extraction
 * @access  Private (Student)
 */
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file (PDF or DOCX).' });
    }

    // 1. Extract text
    const extractedText = await resumeParser.extractText(req.file);

    // 2. Analyze extracted text using AI Service
    const analysis = await aiService.analyzeResume(extractedText);

    // 3. Deactivate previous resumes
    await Resume.updateMany({ studentId: req.user._id }, { isActive: false });

    // Determine version number
    const count = await Resume.countDocuments({ studentId: req.user._id });

    // 4. Create new Resume document
    const resume = await Resume.create({
      studentId: req.user._id,
      fileMetadata: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
      extractedText,
      extractedSkills: analysis.extractedSkills,
      projects: analysis.projects,
      internships: analysis.internships,
      certifications: analysis.certifications,
      education: analysis.education,
      analysisResults: analysis.analysisResults,
      version: count + 1,
      isActive: true,
      uploadedAt: new Date(),
    });

    await recordAuditLog({
      actor: req.user,
      action: 'Uploaded Placement Resume',
      targetType: 'Resume',
      targetId: resume._id,
      metadata: { originalName: req.file.originalname, version: resume.version },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully. Please review the extracted skills before generating questions.',
      data: resume,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/resumes/active
 * @desc    Get student's active resume and assessment history
 * @access  Private (Student)
 */
exports.getActiveResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      studentId: req.user._id,
      isActive: true,
    }).sort({ version: -1 });

    const versions = await Resume.find({ studentId: req.user._id })
      .select('version uploadedAt analysisResults fileMetadata.originalName')
      .sort({ version: -1 });

    const recentQuestionSets = await AIQuestionSet.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        resume,
        versions,
        recentQuestionSets,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   PUT /api/resumes/:id/confirm-skills
 * @desc    Confirm or adjust extracted skills before assessment creation
 * @access  Private (Student)
 */
exports.confirmSkills = async (req, res) => {
  try {
    const { extractedSkills, projects } = req.body;
    const resume = await Resume.findOne({ _id: req.params.id, studentId: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (extractedSkills) resume.extractedSkills = extractedSkills;
    if (projects) resume.projects = projects;

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Skills confirmed and updated.',
      data: resume,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/resumes/:id/generate-questions
 * @desc    Generate personalized interview questions based on confirmed resume
 * @access  Private (Student)
 */
exports.generateQuestions = async (req, res) => {
  try {
    const { difficulty = 'Intermediate' } = req.body;
    const resume = await Resume.findOne({ _id: req.params.id, studentId: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Call AI Service
    const generated = await aiService.generatePersonalizedQuestions({
      skills: resume.extractedSkills,
      projects: resume.projects,
      difficulty,
    });

    const maxScore = generated.questions.reduce((acc, q) => acc + (q.maxMarks || 10), 0);

    const questionSet = await AIQuestionSet.create({
      studentId: req.user._id,
      resumeId: resume._id,
      difficulty,
      questions: generated.questions,
      maxScore,
      status: 'generated',
      generationMetadata: generated.generationMetadata || {
        model: 'Intelligent Placement NLP Engine',
        provider: 'Local Semantic Generator',
        generatedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Personalized questions generated successfully.',
      data: questionSet,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/resumes/question-sets/:id/submit
 * @desc    Submit student answers for AI evaluation
 * @access  Private (Student)
 */
exports.submitAIAssessment = async (req, res) => {
  try {
    const { answers = [] } = req.body; // [{ questionId, studentAnswer }]
    const questionSet = await AIQuestionSet.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    });

    if (!questionSet) {
      return res.status(404).json({ success: false, message: 'Question set not found' });
    }

    let totalScore = 0;

    for (const q of questionSet.questions) {
      const qIdStr = q._id.toString();
      const submitted = answers.find(a => a.questionId?.toString() === qIdStr);
      const studentAns = submitted?.studentAnswer || '';

      q.studentAnswer = studentAns;

      // Evaluate using AI Service
      const evalResult = await aiService.evaluateWrittenAnswer({
        question: q.questionText,
        expectedAnswer: q.expectedAnswer,
        rubric: q.evaluationRubric,
        studentAnswer: studentAns,
      });

      const marks = Math.min(q.maxMarks || 10, Math.round(((evalResult.marksObtained || 70) / 100) * (q.maxMarks || 10)));
      totalScore += marks;

      q.evaluation = {
        marksObtained: marks,
        conceptAccuracy: evalResult.conceptAccuracy || 30,
        technicalCorrectness: evalResult.technicalCorrectness || 30,
        missingPoints: evalResult.missingPoints || [],
        suggestedImprovements: evalResult.suggestedImprovements || 'Review core syntax and architectural patterns.',
        sampleStrongAnswer: evalResult.sampleStrongAnswer || q.expectedAnswer,
      };
    }

    questionSet.totalScore = totalScore;
    questionSet.status = 'evaluated';
    questionSet.adaptiveRecommendations = {
      recommendedTopics: ['Component Lifecycle & Reconciliation', 'Database Indexing & Normalization', 'OOP Interfaces'],
      practiceAdvice: 'You demonstrated solid conceptual understanding. Practice articulating the STAR framework in HR scenarios and time complexity tradeoffs in technical questions.',
      recommendedCourses: ['Advanced Data Structures', 'Full Stack Placement Masterclass'],
      suggestedCompanies: ['TCS Digital', 'Zoho Corp', 'Cognizant GenC Next'],
    };

    await questionSet.save();

    res.status(200).json({
      success: true,
      message: 'Assessment evaluated successfully.',
      data: questionSet,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   PUT /api/resumes/questions/:qId/flag
 * @desc    Flag an AI-generated question for incorrectness or feedback
 * @access  Private (Student)
 */
exports.flagQuestion = async (req, res) => {
  try {
    const { feedback } = req.body;
    const questionSet = await AIQuestionSet.findOne({
      'questions._id': req.params.qId,
      studentId: req.user._id,
    });

    if (!questionSet) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const question = questionSet.questions.id(req.params.qId);
    question.isFlaggedAsIncorrect = true;
    question.flagFeedback = feedback || 'Flagged by student as ambiguous or inaccurate';

    await questionSet.save();

    res.status(200).json({
      success: true,
      message: 'Question feedback recorded. Our faculty and admin team will review it.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
