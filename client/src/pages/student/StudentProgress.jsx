import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Flame,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StudentProgress() {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await studentAPI.getTestHistory();
        if (res.data.success) {
          setHistoryData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student progress history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling student historical test analytics and heatmap..." />;
  if (!historyData) return <div className="p-8 text-center text-slate-500">No test history available.</div>;

  const {
    totalTests,
    totalQuestionsAttempted,
    correctAnswers,
    incorrectAnswers,
    accuracyRate,
    timeSpentHours,
    currentStreak,
    heatmapData,
    weeklyTrends,
    topicWiseAccuracy,
    attempts
  } = historyData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <span>My Placement Preparation & Progress Analytics</span>
        </h1>
        <p className="text-xs text-slate-500">
          Track question accuracy, learning streaks, weekly performance trends, and calendar practice activity.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Questions</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{totalQuestionsAttempted}</h3>
          <span className="text-xs text-emerald-600 font-bold">{correctAnswers} Correct</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Accuracy</span>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{accuracyRate}%</h3>
          <span className="text-xs text-slate-500 font-medium">Across all topics</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Spent Practicing</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{timeSpentHours} hrs</h3>
          <span className="text-xs text-slate-500 font-medium">Recorded tests & coding</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Streak</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1">{currentStreak} Days</h3>
          <span className="text-xs text-amber-600 font-bold flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>Active Learner</span>
          </span>
        </div>
      </div>

      {/* Activity Heatmap Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Daily Practice Activity Heatmap (Last 90 Days)</span>
          </h2>
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-100" />
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-200" />
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-400" />
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Blocks */}
        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
          {(heatmapData || []).map((day, idx) => {
            const count = day.count || 0;
            const bgClass =
              count === 0
                ? 'bg-slate-200/80'
                : count === 1
                ? 'bg-indigo-300'
                : count === 2
                ? 'bg-indigo-500'
                : 'bg-indigo-700';

            return (
              <div
                key={idx}
                title={`${day.date}: ${count} tests completed`}
                className={`w-3.5 h-3.5 rounded-xs ${bgClass} transition-all hover:scale-125 cursor-pointer`}
              />
            );
          })}
        </div>
      </div>

      {/* Charts Grid: Weekly Trend & Topic Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Trend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Weekly Score Progression Trend</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, border: 'none', color: '#FFF', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic-Wise Accuracy */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Topic-Wise Accuracy Rates</span>
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {topicWiseAccuracy.map((t, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">{t.topic}</span>
                  <span className="font-bold text-slate-900">{t.accuracy}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      t.accuracy >= 75 ? 'bg-emerald-500' : t.accuracy >= 60 ? 'bg-indigo-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${t.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Attempts Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>All Test Attempts History</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Assessment Title</th>
                <th className="pb-3">Language</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attempts.map((att) => (
                <tr key={att._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{att.assessmentId?.title || 'Daily Diagnostic Test'}</td>
                  <td className="py-3 text-slate-600">{att.assessmentId?.programmingLanguage || 'Mixed'}</td>
                  <td className="py-3 text-slate-500 font-mono">{Math.round((att.durationSeconds || 900) / 60)} mins</td>
                  <td className="py-3 font-extrabold text-indigo-600">{att.percentage}%</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      att.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {att.passed ? 'Passed' : 'Failed Cutoff'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{new Date(att.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
