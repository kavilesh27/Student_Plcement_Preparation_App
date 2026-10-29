import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Code2,
  BarChart3,
  GraduationCap,
  Sparkles,
  CalendarDays,
  Bell,
  User,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  FolderGit2,
  LogOut,
  Flame,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, role, theme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Nav items strictly isolated per role
  const getNavItems = () => {
    if (role === 'staff') {
      return [
        { name: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
        { name: 'Company Management', path: '/staff/companies', icon: Building2 },
        { name: 'Student Progress', path: '/staff/students', icon: Users },
        { name: 'Daily Test Reports', path: '/staff/tests', icon: CalendarCheck },
        { name: 'Students Requiring Support', path: '/staff/support', icon: AlertTriangle, highlight: true },
        { name: 'Training Management', path: '/staff/training', icon: GraduationCap },
        { name: 'Reports & Export', path: '/staff/reports', icon: FileSpreadsheet },
        { name: 'Notifications', path: '/staff/notifications', icon: Bell },
      ];
    }

    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Student Management', path: '/admin/students', icon: Users },
        { name: 'Staff Management', path: '/admin/staff', icon: ShieldCheck },
        { name: 'Department Management', path: '/admin/departments', icon: FolderGit2 },
        { name: 'Company Drives', path: '/admin/companies', icon: Building2 },
        { name: 'Test Management', path: '/admin/assessments', icon: CalendarCheck },
        { name: 'Training Management', path: '/admin/training', icon: GraduationCap },
        { name: 'System Audit Logs', path: '/admin/audit-logs', icon: FileSpreadsheet },
        { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
      ];
    }

    // Default strictly: Student role
    return [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Company Drives', path: '/student/companies', icon: Building2 },
      { name: 'Daily Tests', path: '/student/daily-tests', icon: CalendarCheck },
      { name: 'Coding Practice', path: '/student/coding', icon: Code2 },
      { name: 'AI Resume Assessment', path: '/student/resume-assessment', icon: Sparkles, badge: 'AI' },
      { name: 'My Progress', path: '/student/progress', icon: BarChart3 },
      { name: 'Advanced Training', path: '/student/training', icon: GraduationCap },
      { name: 'Study Planner', path: '/student/study-plan', icon: CalendarDays },
      { name: 'Notifications', path: '/student/notifications', icon: Bell },
      { name: 'My Profile & Portfolio', path: '/student/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl ${theme.classes.sidebarBrandBg} flex items-center justify-center text-white shadow-md font-bold`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight block">PlacementPrep</span>
              <span className={`text-[9px] uppercase font-bold tracking-wider ${theme.classes.sidebarBrandText} -mt-0.5 block`}>
                {theme.roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Student Streak Pill (if student) */}
        {role === 'student' && user?.currentStreak && (
          <div className="mx-4 mt-3 p-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-blue-500 text-blue-500" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">{user.currentStreak} Day Streak!</div>
                <div className="text-[11px] text-slate-500">Practice today to maintain</div>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-100 shadow-xs">
              Active
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? `${theme.classes.navActiveBg} ${theme.classes.navActiveText}`
                      : item.highlight
                      ? 'text-amber-700 bg-amber-50/60 hover:bg-amber-100/70'
                      : theme.classes.navInactiveText
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? theme.classes.navActiveIcon : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`${theme.classes.badgePrimary} text-[10px] font-bold px-1.5 py-0.5 rounded-md`}>
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Profile & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-full ${theme.classes.avatarSoftBg} font-bold flex items-center justify-center text-xs shrink-0`}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-500 truncate capitalize">{role || 'Student'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
