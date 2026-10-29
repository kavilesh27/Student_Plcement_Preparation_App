import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccessDenied() {
  const { user, role, logout, theme } = useAuth();
  const navigate = useNavigate();

  const getAuthorizedPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            You do not have permission to access this administrative or staff area with your current{' '}
            <strong className="text-slate-800 capitalize">{role || 'student'}</strong> account.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Authenticated As:</span>
            <span className="font-semibold text-slate-900">{user?.name || 'User'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned Role:</span>
            <span className="font-bold text-indigo-600 capitalize">{role || 'Student'}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate(getAuthorizedPath(), { replace: true })}
            className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
