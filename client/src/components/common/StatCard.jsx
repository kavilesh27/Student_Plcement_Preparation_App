import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend, onClick }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-indigo-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
            {trend && (
              <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
