import React from 'react';
import {
  Settings,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  FileCode,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PlatformSettings() {
  const configs = [
    {
      name: 'Primary Database (MongoDB)',
      status: 'Connected',
      value: 'mongodb://localhost:27017/placement_portal',
      type: 'Local MongoDB Community Server (Active)',
      healthy: true,
      icon: Database,
    },
    {
      name: 'AI Engine Integration',
      status: 'Configurable Multi-Provider',
      value: 'Gemini 1.5 Flash API with Smart Semantic Offline Fallback',
      type: 'Intelligent Placement NLP & Rubric Evaluator Engine',
      healthy: true,
      icon: Cpu,
    },
    {
      name: 'Coding Execution Sandbox',
      status: 'Transparent Safe Mock Mode Active',
      value: 'Safe Sandbox Runner (Non-blocking simulated evaluation)',
      type: 'Supports Judge0 & Piston APIs via CODE_EXECUTION_API_URL',
      healthy: true,
      icon: FileCode,
    },
    {
      name: 'Authentication & Security',
      status: 'Enforced',
      value: 'HMAC-SHA256 JWT & bcrypt salt rounds (10)',
      type: 'Role-Based Access Control (Student, Staff, Admin)',
      healthy: true,
      icon: Key,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Platform Settings & System Environment Status</span>
        </h1>
        <p className="text-xs text-slate-500">
          Backend server settings, third-party provider configurations, and service connectivity diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map((cfg, idx) => {
          const Icon = cfg.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{cfg.status}</span>
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{cfg.name}</h3>
                <p className="text-xs font-mono text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 truncate">
                  {cfg.value}
                </p>
                <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                  {cfg.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
