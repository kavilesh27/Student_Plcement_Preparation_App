import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Code2,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Award
} from 'lucide-react';
import { assessmentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DailyTests() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: optionId }
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    fetchAssessments();
  }, [selectedLanguage]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await assessmentAPI.getAll({
        language: selectedLanguage !== 'All' ? selectedLanguage : undefined,
      });
      if (res.data.success) {
        setAssessments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId) => {
    try {
      const res = await assessmentAPI.getById(testId);
      if (res.data.success) {
        const test = res.data.data.assessment;
        setActiveTest(test);
        setActiveQuestionIdx(0);
        setAnswers({});
        setTimeLeft((test.durationMinutes || 15) * 60);
        setTestResult(null);
      }
    } catch (err) {
      console.error('Failed to start test:', err);
    }
  };

  // Timer countdown when active test is running
  useEffect(() => {
    if (!activeTest || testResult) return;
    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [activeTest, timeLeft, testResult]);

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    setIsSubmitting(true);
    try {
      const formattedAnswers = (activeTest.questions || []).map((q) => ({
        questionId: q._id,
        studentAnswer: answers[q._id] || '',
      }));

      const res = await assessmentAPI.submit(activeTest._id, {
        answers: formattedAnswers,
        durationSeconds: (activeTest.durationMinutes * 60) - timeLeft,
      });

      if (res.data.success) {
        setTestResult(res.data.data);
      }
    } catch (err) {
      console.error('Error submitting test:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner text="Fetching daily tests and practice assessments..." />;

  // Test Runner Active Screen
  if (activeTest) {
    const currentQ = activeTest.questions[activeQuestionIdx];
    const totalQ = activeTest.questions.length;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Assessment Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {activeTest.programmingLanguage} • {activeTest.difficulty}
            </span>
            <h2 className="text-lg font-bold text-slate-900">{activeTest.title}</h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
              timeLeft < 180 ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Evaluating...' : 'Finish & Submit'}
            </button>
          </div>
        </div>

        {/* Results Modal / Banner after submission */}
        {testResult ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white ${
                testResult.passed ? 'bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-rose-500 shadow-lg shadow-rose-100'
              }`}>
                {testResult.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {testResult.passed ? 'Assessment Passed!' : 'Needs Improvement'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">{testResult.feedback}</p>
            </div>

            {/* Score Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Your Score</span>
                <span className="text-xl font-extrabold text-slate-900">{testResult.percentage}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Marks Awarded</span>
                <span className="text-xl font-extrabold text-indigo-600">{testResult.score} / {testResult.maximumScore}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Passing Cutoff</span>
                <span className="text-xl font-extrabold text-slate-900">{activeTest.passingPercentage}%</span>
              </div>
            </div>

            {/* Topic Performance */}
            {testResult.topicPerformance && testResult.topicPerformance.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Topic Performance Breakdown:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {testResult.topicPerformance.map((tp, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{tp.topic}</span>
                      <span className="font-extrabold text-indigo-600">{tp.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question by Question Review */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">Detailed Explanations & Model Answers:</span>
              <div className="space-y-3">
                {testResult.evaluatedAnswers.map((ea, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Question {idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ea.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ea.isCorrect ? 'Correct (+5)' : 'Incorrect (0)'}
                      </span>
                    </div>
                    {ea.evaluationFeedback?.expectedAnswer && (
                      <p className="text-slate-600">
                        <strong>Expected Answer:</strong> {ea.evaluationFeedback.expectedAnswer}
                      </p>
                    )}
                    {ea.evaluationFeedback?.explanation && (
                      <p className="text-slate-500 italic">
                        <strong>Explanation:</strong> {ea.evaluationFeedback.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTest(null);
                setTestResult(null);
                fetchAssessments();
              }}
              className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all shadow-xs"
            >
              Back to Daily Tests Catalog
            </button>
          </div>
        ) : (
          /* Live Question Form */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            {/* Question Progress & Navigation Pills */}
            <div className="flex flex-wrap gap-2">
              {activeTest.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    idx === activeQuestionIdx
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : answers[activeTest.questions[idx]._id]
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Question {activeQuestionIdx + 1} of {totalQ}</span>
                <span className="font-semibold text-indigo-600">{currentQ?.topic}</span>
              </div>

              <div className="text-sm font-bold text-slate-900 whitespace-pre-line leading-relaxed font-mono bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {currentQ?.questionText}
              </div>
            </div>

            {/* Options */}
            {currentQ?.options && currentQ.options.length > 0 && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ._id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ._id, opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center space-x-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opt.id}
                      </div>
                      <span className="font-mono">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={activeQuestionIdx === 0}
                onClick={() => setActiveQuestionIdx((idx) => idx - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {activeQuestionIdx < totalQ - 1 ? (
                <button
                  onClick={() => setActiveQuestionIdx((idx) => idx + 1)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs"
                >
                  <span>Submit Answers</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Daily Tests Catalog List
  return (
    <div className="space-y-6">
      {/* Header & Language Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <span>Daily Placement Programming Tests</span>
          </h1>
          <p className="text-xs text-slate-500">
            Daily diagnostic assessments in C, C++, Java, and Quantitative Aptitude designed to simulate real placement rounds.
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          {['All', 'C', 'C++', 'Java', 'Aptitude'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedLanguage === lang
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((test) => (
          <div
            key={test._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {test.programmingLanguage}
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{test.durationMinutes || 15} mins</span>
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base">{test.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{test.description}</p>

              {/* Topics Pills */}
              {test.topics && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {test.topics.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Passing Cutoff: <strong className="text-slate-800">{test.passingPercentage}%</strong>
              </span>

              <button
                onClick={() => handleStartTest(test._id)}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
