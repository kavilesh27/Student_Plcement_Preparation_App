import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  FolderGit2,
  CalendarCheck,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Compiling university placement operations & audit metrics..." />;
  if (!data) return <div className="p-8 text-center text-slate-500">Failed to load admin data.</div>;

  const { metrics, monthlyTrends, deptComparison } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <span>University Placement Administration & Platform KPIs</span>
        </h1>
        <p className="text-xs text-slate-500">
          Institution-level oversight of campus recruitment drives, department outcomes, user credentials, and audit logs.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={metrics.totalStudents}
          subtitle={`${metrics.activeStudents} Active`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Placement Staff"
          value={metrics.totalStaff}
          subtitle="Coordinators & trainers"
          icon={ShieldCheck}
          color="blue"
        />
        <StatCard
          title="Recruitment Drives"
          value={metrics.totalDrives}
          subtitle={`${metrics.upcomingDrives} Upcoming drives`}
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Daily Test Participation"
          value={`${metrics.dailyParticipationRate}%`}
          subtitle="Campus average"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progression */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Institution-Wide Placement Readiness Trend</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, border: 'none', color: '#FFF', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="placementReadiness" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#adminGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Comparison */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            <span>Average Readiness by Department</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, border: 'none', color: '#FFF', fontSize: 12 }}
                />
                <Bar dataKey="avgReadiness" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
