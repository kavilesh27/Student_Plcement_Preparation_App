import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle,
  Building,
  Code,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Clock,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { studentAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await studentAPI.getDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Analyzing student placement status and readiness..." />;
  if (!data) return <div className="p-8 text-center text-slate-500">Failed to load dashboard data.</div>;

  const { summary, readiness, upcomingDrives, recentAttempts } = data;

  const chartData = [
    { name: 'Aptitude', score: readiness?.scoreBreakdown?.aptitude?.score || 68 },
    { name: 'Coding', score: readiness?.scoreBreakdown?.programming?.score || 72 },
    { name: 'Core CS', score: readiness?.scoreBreakdown?.technicalKnowledge?.score || 70 },
    { name: 'Resume', score: readiness?.scoreBreakdown?.resumeCompleteness?.score || 85 },
    { name: 'Interview', score: readiness?.scoreBreakdown?.communication?.score || 75 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Placement Readiness Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Placement Journey is on Track!
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm">
            You are eligible for <span className="font-bold underline decoration-amber-400">{summary.eligibleCompaniesCount} campus drives</span>. Complete today's C/Java challenge to maintain your streak.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/student/daily-tests')}
            className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-bold shadow-md hover:bg-indigo-50 transition-all flex items-center space-x-2"
          >
            <Code className="w-4 h-4" />
            <span>Take Today's Test</span>
          </button>
          <button
            onClick={() => navigate('/student/resume-assessment')}
            className="px-5 py-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white text-xs font-bold border border-indigo-400/40 transition-all flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>AI Resume Mock</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Placement Readiness"
          value={`${summary.placementReadinessPercentage}%`}
          subtitle={`Level: ${summary.preparationLevel}`}
          icon={TrendingUp}
          color="indigo"
          trend="+6.4% this week"
          onClick={() => navigate('/student/progress')}
        />
        <StatCard
          title="Tests Completed"
          value={summary.totalTestsCompleted}
          subtitle={`Avg score: ${summary.averageTestScore}%`}
          icon={FileCheck}
          color="blue"
          onClick={() => navigate('/student/daily-tests')}
        />
        <StatCard
          title="Eligible Drives"
          value={`${summary.eligibleCompaniesCount} / ${summary.upcomingDrivesCount}`}
          subtitle="Based on recorded criteria"
          icon={Building}
          color="emerald"
          onClick={() => navigate('/student/companies')}
        />
        <StatCard
          title="Learning Streak"
          value={`${summary.currentStreak} Days`}
          subtitle={`Best: ${summary.longestStreak} Days`}
          icon={Flame}
          color="amber"
        />
      </div>

      {/* AI Readiness Section & Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span>AI-Calculated Placement Readiness Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-factor weighted evaluation across aptitude, coding, core CS, resume & interview practice.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              Score: {readiness?.overallReadinessPercentage}%
            </span>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="space-y-3.5">
            {Object.keys(readiness?.scoreBreakdown || {}).map((key) => {
              const item = readiness.scoreBreakdown[key];
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="text-slate-500 font-medium">
                      Weight: {item.weight} | <span className="font-bold text-slate-900">{item.score}%</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strongest vs Weakest Skills Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Strongest Skills</span>
              </span>
              <ul className="text-xs text-emerald-950 space-y-1">
                {(readiness?.strongestSkills || []).map((s, idx) => (
                  <li key={idx} className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
              <span className="text-xs font-bold text-amber-800 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Topics Needing Practice</span>
              </span>
              <ul className="text-xs text-amber-950 space-y-1">
                {(readiness?.weakestSkills || []).map((w, idx) => (
                  <li key={idx} className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note on Readiness:</strong> Placement readiness score measures practice consistency and question accuracy. It is calculated separately from company academic eligibility cutoffs.
            </span>
          </div>
        </div>

        {/* Actionable Next Steps & Study Planner Hook */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Recommended Next Steps</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {(readiness?.nextSteps || []).map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </div>
                  <span className="text-slate-700 font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Weekly Target Progress</span>
              <span className="font-bold text-indigo-600">3.5 / 10 Hours</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '35%' }} />
            </div>
            <button
              onClick={() => navigate('/student/study-plan')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all"
            >
              Open Full Study Planner
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Company Recruitment Drives Carousel/Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <span>Upcoming Recruitment Drives</span>
            </h2>
            <p className="text-xs text-slate-500">
              Campus drives with your evaluated eligibility status. Staff-curated dates and round requirements.
            </p>
          </div>
          <button
            onClick={() => navigate('/student/companies')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
          >
            <span>View All Drives</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcomingDrives.map((company) => {
            const isEligible = company.eligibilityStatus === 'Eligible based on recorded criteria';
            const isVerification = company.eligibilityStatus === 'Needs verification';

            return (
              <div
                key={company._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Company Logo & Status Pill */}
                  <div className="flex items-start justify-between">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs"
                    />
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isVerification
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isEligible ? 'Eligible' : isVerification ? 'Needs Verification' : 'Not Eligible'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {company.jobRoles?.[0]?.title || 'Graduate Engineer Trainee'}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Drive Date:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {new Date(company.driveDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Min CGPA Cutoff:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {company.eligibilityCriteria?.minCGPA || 6.5}+
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Recruitment Rounds:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {company.recruitmentRounds?.length || 3} Stages
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student/companies/${company._id}`)}
                  className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Start Preparation</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Test History Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            <span>Recent Test Activity & Performance</span>
          </h3>
          <button
            onClick={() => navigate('/student/progress')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Full Test History
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentAttempts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No test attempts recorded yet.</div>
          ) : (
            recentAttempts.map((attempt) => (
              <div key={attempt._id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">{attempt.assessmentId?.title || 'Daily Test'}</p>
                  <p className="text-slate-500">
                    Language: <span className="font-semibold text-slate-700">{attempt.assessmentId?.programmingLanguage || 'Mixed'}</span> • Submitted: {new Date(attempt.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-slate-900">{attempt.percentage}%</span>
                    <span className="block text-[10px] text-slate-400">
                      {attempt.passed ? 'Passed Cutoff' : 'Below Cutoff'}
                    </span>
                  </div>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      attempt.passed ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
