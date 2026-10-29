import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flag,
  ArrowRight,
  BookOpen,
  Award,
  ShieldCheck,
  Send,
  Building
} from 'lucide-react';
import { resumeAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ResumeAssessment() {
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [questionSet, setQuestionSet] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [answers, setAnswers] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [flagModal, setFlagModal] = useState({ open: false, questionId: null, feedback: '' });

  useEffect(() => {
    fetchActiveResume();
  }, []);

  const fetchActiveResume = async () => {
    setLoading(true);
    try {
      const res = await resumeAPI.getActive();
      if (res.data.success) {
        setActiveResume(res.data.data.resume);
        if (res.data.data.recentQuestionSets?.length > 0) {
          setQuestionSet(res.data.data.recentQuestionSets[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load active resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await resumeAPI.upload(formData);
      if (res.data.success) {
        setActiveResume(res.data.data);
        setQuestionSet(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading resume');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!activeResume) return;
    setGenerating(true);
    try {
      const res = await resumeAPI.generateQuestions(activeResume._id, {
        difficulty: selectedDifficulty,
      });
      if (res.data.success) {
        setQuestionSet(res.data.data);
        setAnswers({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAIAssessment = async () => {
    if (!questionSet) return;
    setEvaluating(true);
    try {
      const formattedAnswers = (questionSet.questions || []).map((q) => ({
        questionId: q._id,
        studentAnswer: answers[q._id] || '',
      }));

      const res = await resumeAPI.submitAssessment(questionSet._id, {
        answers: formattedAnswers,
      });

      if (res.data.success) {
        setQuestionSet(res.data.data);
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleFlagQuestion = async () => {
    if (!flagModal.questionId) return;
    try {
      await resumeAPI.flagQuestion(flagModal.questionId, { feedback: flagModal.feedback });
      alert('Feedback submitted. Faculty review team notified.');
      setFlagModal({ open: false, questionId: null, feedback: '' });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Checking student resume profile and AI assessment engine..." />;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Personalization Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI Resume Analyzer & Mock Interview
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm">
            Upload your resume (PDF/DOCX). Our AI analyzes your declared projects and skills, generates customized technical interview questions, and evaluates your written answers against standard rubrics.
          </p>
        </div>
      </div>

      {/* Step 1: Resume Upload & Extraction Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Step 1: Upload Student Resume</span>
          </h2>
          <p className="text-xs text-slate-500">
            Upload PDF or DOCX file (Max 5MB). Files are securely stored and isolated per student.
          </p>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
              <FileText className="w-8 h-8 text-indigo-500 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                {file ? file.name : 'Click to select or drag & drop resume'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">PDF or DOCX documents</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {uploading ? 'Extracting Resume Skills...' : 'Upload & Run AI Skill Extraction'}
            </button>
          </form>

          {activeResume && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Resume Version:</span>
              <p className="font-bold text-slate-800">{activeResume.fileMetadata?.originalName}</p>
              <p className="text-[11px] text-slate-500">
                Version {activeResume.version} • Uploaded {new Date(activeResume.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Extracted Skills & Projects Confirmation Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Step 2: Extracted Technical Profile Confirmation</span>
            </h2>
            {activeResume && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                ATS Score: {activeResume.analysisResults?.resumeCompletenessScore || 85}%
              </span>
            )}
          </div>

          {activeResume ? (
            <div className="space-y-4 text-xs">
              {/* Programming Languages */}
              <div>
                <span className="font-bold text-slate-700 block mb-1.5">Programming Languages Extracted:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeResume.extractedSkills?.programmingLanguages || []).map((l, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-100">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Frameworks & Databases */}
              <div>
                <span className="font-bold text-slate-700 block mb-1.5">Frameworks & Databases:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeResume.extractedSkills?.frameworks || []).concat(activeResume.extractedSkills?.databases || []).map((fw, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium border border-blue-100">
                      {fw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <span className="font-bold text-slate-700 block mb-1.5">Academic / Portfolio Projects Identified:</span>
                <div className="space-y-2">
                  {(activeResume.projects || []).map((proj, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <strong className="text-slate-900 font-bold block">{proj.title}</strong>
                      <p className="text-slate-600 text-[11px] mt-0.5">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3 Action: Trigger Question Generation */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Difficulty Level:</span>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateQuestions}
                  disabled={generating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{generating ? 'Synthesizing Questions...' : 'Generate Personalized Assessment'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Please upload a resume in Step 1 to extract skills and generate personalized questions.
            </div>
          )}
        </div>
      </div>

      {/* Step 4 & 5: Personalized Assessment Questions & AI Evaluation */}
      {questionSet && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Generated Assessment • {questionSet.difficulty}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Personalized Technical Interview Questions</h2>
              <p className="text-xs text-slate-500">
                Generated specifically from your declared projects and skills. Answer each question in the text box below.
              </p>
            </div>

            {questionSet.status === 'evaluated' && (
              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-slate-500 block">AI Evaluation Score</span>
                <span className="text-2xl font-black text-indigo-600">
                  {questionSet.totalScore} / {questionSet.maxScore} Marks
                </span>
              </div>
            )}
          </div>

          {/* List of Questions */}
          <div className="space-y-6">
            {questionSet.questions.map((q, idx) => (
              <div
                key={q._id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                      {q.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {idx + 1}. {q.questionText}
                    </h3>
                  </div>

                  <button
                    onClick={() => setFlagModal({ open: true, questionId: q._id, feedback: '' })}
                    title="Report question"
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Student Answer Textarea */}
                <div>
                  <textarea
                    rows={3}
                    disabled={questionSet.status === 'evaluated'}
                    value={answers[q._id] || q.studentAnswer || ''}
                    onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                    placeholder="Type your technical written answer here..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-sans"
                  />
                </div>

                {/* AI Evaluation Card if evaluated */}
                {q.evaluation && questionSet.status === 'evaluated' && (
                  <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Marks Awarded: <strong className="text-indigo-600">{q.evaluation.marksObtained} / {q.maxMarks}</strong>
                      </span>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                        <span>Concept: <strong>{q.evaluation.conceptAccuracy}%</strong></span>
                        <span>Correctness: <strong>{q.evaluation.technicalCorrectness}%</strong></span>
                      </div>
                    </div>

                    {q.evaluation.suggestedImprovements && (
                      <p className="text-slate-600">
                        <strong>Feedback:</strong> {q.evaluation.suggestedImprovements}
                      </p>
                    )}

                    {q.evaluation.sampleStrongAnswer && (
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 text-[11px]">
                        <strong className="block text-indigo-700 font-semibold mb-0.5">Sample Strong Answer:</strong>
                        {q.evaluation.sampleStrongAnswer}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit for AI Evaluation */}
          {questionSet.status !== 'evaluated' ? (
            <button
              onClick={handleSubmitAIAssessment}
              disabled={evaluating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{evaluating ? 'AI Evaluating Your Written Answers...' : 'Submit Answers for AI Evaluation'}</span>
            </button>
          ) : (
            /* Adaptive Recommendations Output */
            questionSet.adaptiveRecommendations && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 space-y-3">
                <h4 className="text-sm font-bold text-indigo-950 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Adaptive Learning & Revision Advice</span>
                </h4>
                <p className="text-xs text-indigo-900">{questionSet.adaptiveRecommendations.practiceAdvice}</p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-700">Target Companies:</span>
                  {(questionSet.adaptiveRecommendations.suggestedCompanies || []).map((c, i) => (
                    <span key={i} className="text-xs font-bold bg-white text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Flag Question Modal */}
      {flagModal.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900">Report Question Feedback</h3>
            <p className="text-xs text-slate-500">
              Is this question inaccurate or ambiguous? Describe the issue for our placement review faculty.
            </p>
            <textarea
              rows={3}
              value={flagModal.feedback}
              onChange={(e) => setFlagModal({ ...flagModal, feedback: e.target.value })}
              placeholder="e.g. Question terminology seems outdated or unclear..."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setFlagModal({ open: false, questionId: null, feedback: '' })}
                className="px-3 py-1.5 bg-slate-100 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagQuestion}
                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
