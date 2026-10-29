import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Terminal,
  Clock,
  Cpu,
  Layers,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { codingAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CodingPractice() {
  const [problems, setProblems] = useState([]);
  const [activeProblem, setActiveProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('Java');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState('testcases'); // 'testcases' | 'submissions'
  const [pastSubmissions, setPastSubmissions] = useState([]);

  // Boilerplate templates for languages
  const templates = {
    C: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    // Write your C solution here\n    printf("Solution Output\\n");\n    return 0;\n}`,
    'C++': `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    cout << "Solution Output" << endl;\n    return 0;\n}`,
    Java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your Java solution here\n        System.out.println("Solution Output");\n    }\n}`,
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await codingAPI.getProblems();
      if (res.data.success && res.data.data.length > 0) {
        setProblems(res.data.data);
        handleSelectProblem(res.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to load coding problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = async (problem) => {
    setActiveProblem(problem);
    const lang = problem.language || 'Java';
    setSelectedLanguage(lang);
    setCode(problem.starterCode || templates[lang] || templates.Java);
    setLastSubmission(null);

    // Fetch past submissions
    try {
      const res = await codingAPI.getProblemById(problem._id);
      if (res.data.success) {
        setPastSubmissions(res.data.data.pastSubmissions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (activeProblem?.starterCode && activeProblem.language === lang) {
      setCode(activeProblem.starterCode);
    } else {
      setCode(templates[lang] || '');
    }
  };

  const handleSubmitCode = async () => {
    if (!activeProblem) return;
    setSubmitting(true);
    try {
      const res = await codingAPI.submit({
        problemId: activeProblem._id,
        language: selectedLanguage,
        code,
      });

      if (res.data.success) {
        setLastSubmission(res.data.data);
        setPastSubmissions((prev) => [res.data.data, ...prev]);
        setActiveTab('testcases');
      }
    } catch (err) {
      console.error('Error submitting code:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Initializing secure coding practice sandbox..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Code2 className="w-6 h-6 text-indigo-600" />
            <span>Placement Programming Practice & Sandbox</span>
          </h1>
          <p className="text-xs text-slate-500">
            Daily coding problems in C, C++, and Java with isolated test case execution and transparent evaluation.
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Directory & Description (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Problem Selector Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Select Problem:
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {problems.map((prob) => (
                <button
                  key={prob._id}
                  onClick={() => handleSelectProblem(prob)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                    activeProblem?._id === prob._id
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate pr-2">{prob.topic} — {prob.language}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                      prob.submissionStatus === 'Solved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prob.submissionStatus === 'Attempted'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {prob.submissionStatus || 'Unsolved'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Problem Statement Card */}
          {activeProblem && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {activeProblem.topic}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Difficulty: <strong className="text-indigo-600">{activeProblem.difficulty}</strong>
                </span>
              </div>

              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-mono bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {activeProblem.questionText}
              </div>

              {/* Sample Test Cases */}
              {activeProblem.testCases && activeProblem.testCases.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Sample Test Cases:</span>
                  {activeProblem.testCases.slice(0, 2).map((tc, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono space-y-1">
                      <div>
                        <strong className="text-slate-500 block text-[10px] uppercase">Input:</strong>
                        <span className="text-slate-800">{tc.input || 'None'}</span>
                      </div>
                      <div>
                        <strong className="text-slate-500 block text-[10px] uppercase">Expected Output:</strong>
                        <span className="text-emerald-700 font-bold">{tc.expectedOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Execution Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl text-white">
            {/* Editor Toolbar */}
            <div className="h-12 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">Code Editor</span>

                {/* Language Switcher */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 px-2.5 py-1 rounded-lg outline-none"
                >
                  <option value="C">C</option>
                  <option value="C++">C++</option>
                  <option value="Java">Java</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCode(templates[selectedLanguage] || '')}
                  title="Reset to Template"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSubmitCode}
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{submitting ? 'Running Code...' : 'Run & Evaluate'}</span>
                </button>
              </div>
            </div>

            {/* Code Textarea Area */}
            <div className="p-4 bg-slate-900">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                spellCheck="false"
                className="w-full bg-transparent font-mono text-xs text-indigo-100 outline-none resize-none leading-relaxed"
                placeholder="// Enter code here..."
              />
            </div>
          </div>

          {/* Evaluation Mode Transparency Banner */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl text-xs text-indigo-950 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Execution Sandbox Mode:</strong>
              <span className="text-[11px] text-slate-600">
                {lastSubmission?.evaluationMode || 'Local Simulated Test Runner (Safe Sandbox Mock Mode — untrusted code is never executed directly inside the Node.js application process).'}
              </span>
            </div>
          </div>

          {/* Test Case Output & Submission History Tabs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('testcases')}
                className={`pb-2 border-b-2 transition-all ${
                  activeTab === 'testcases' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Test Results
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`pb-2 border-b-2 transition-all ${
                  activeTab === 'submissions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Submission History ({pastSubmissions.length})
              </button>
            </div>

            {activeTab === 'testcases' ? (
              lastSubmission ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          lastSubmission.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {lastSubmission.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {lastSubmission.testCasesPassed} / {lastSubmission.totalTestCases} Test Cases Passed
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{lastSubmission.executionTimeMs}ms</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{lastSubmission.memoryKb}KB</span>
                      </span>
                    </div>
                  </div>

                  {lastSubmission.errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded-xl">
                      {lastSubmission.errorMessage}
                    </div>
                  )}

                  {/* Individual Test Case Breakdown */}
                  <div className="space-y-2">
                    {lastSubmission.testCaseDetails?.map((tc) => (
                      <div
                        key={tc.testCaseNumber}
                        className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                          tc.passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800">Test Case #{tc.testCaseNumber}</span>
                          <div className="text-[11px] text-slate-600">
                            Expected: <span className="font-semibold">{tc.expectedOutput}</span> | Actual: <span className="font-semibold">{tc.actualOutput || 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          tc.passed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                        }`}>
                          {tc.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Click "Run & Evaluate" to test your code against problem test cases.
                </div>
              )
            ) : (
              /* Past Submissions Table */
              <div className="space-y-2">
                {pastSubmissions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No submissions yet for this problem.</div>
                ) : (
                  pastSubmissions.map((sub) => (
                    <div key={sub._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{sub.language}</span>
                        <span className="text-[11px] text-slate-400 block">
                          {new Date(sub.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-500 font-mono text-[11px]">{sub.executionTimeMs}ms</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          sub.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
