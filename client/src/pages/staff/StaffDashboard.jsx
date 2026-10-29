import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Building2,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { staffAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StaffDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const res = await staffAPI.getDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load staff dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffData();
  }, []);

  if (loading) return <LoadingSpinner text="Aggregating department analytics and student progress..." />;
  if (!data) return <div className="p-8 text-center text-slate-500">Failed to load staff data.</div>;

  const { metrics, departmentScores, languagePerformance, recentActivity } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Placement Coordinator & Faculty Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time student diagnostic tracking, company drives oversight, and early intervention alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/staff/companies')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Create Company Drive</span>
          </button>
          <button
            onClick={() => navigate('/staff/reports')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Reports</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={metrics.totalStudents}
          subtitle="Active undergraduates"
          icon={Users}
          color="indigo"
          onClick={() => navigate('/staff/students')}
        />
        <StatCard
          title="Completed Today"
          value={metrics.completedTodayCount}
          subtitle={`${metrics.missedTodayCount} students pending`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Students Needing Support"
          value={metrics.studentsNeedingSupport}
          subtitle="At-risk score / missed tests"
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/staff/support')}
        />
        <StatCard
          title="Average Student Score"
          value={`${metrics.averageScore}%`}
          subtitle="Institution benchmark"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Average Scores */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Average Placement Test Scores by Department</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentScores}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, border: 'none', color: '#FFF', fontSize: 12 }}
                />
                <Bar dataKey="averageScore" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Programming Language Performance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Language-Wise Programming Accuracy</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languagePerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="language" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, border: 'none', color: '#FFF', fontSize: 12 }}
                />
                <Bar dataKey="averageScore" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Student Attempts Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <span>Live Student Practice Test Feed</span>
          </h2>
          <button
            onClick={() => navigate('/staff/students')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            View Full Student Roster
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {(recentActivity || []).map((att) => (
            <div key={att._id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">
                  {att.studentId?.name || 'Student'} ({att.studentId?.studentId || 'ID'})
                </p>
                <p className="text-slate-500">
                  {att.assessmentId?.title || 'Daily Diagnostic'} • {att.studentId?.department}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`font-extrabold text-sm ${att.percentage >= 60 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {att.percentage}%
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  att.percentage >= 60 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {att.percentage >= 60 ? 'Passed' : 'Needs Support'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
