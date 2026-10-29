import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Flame,
  Building,
  Target,
  ArrowRight
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StudyPlanner() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getStudyPlan();
      if (res.data.success) {
        setPlan(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await studentAPI.toggleStudyTask(taskId);
      if (res.data.success) {
        setPlan(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Generating weekly personalized study plan..." />;
  if (!plan) return <div className="p-8 text-center text-slate-500">No active study plan found.</div>;

  const completionPct = Math.round((plan.completedHours / plan.weeklyTargetHours) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            <span>Personalized Weekly Placement Study Planner</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tailored preparation schedule targeting your diagnostic test weaknesses and upcoming campus recruitment drives.
          </p>
        </div>
      </div>

      {/* Target Hours Progress Bar Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Week of {plan.weekStartDate}
            </span>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">Weekly Target: {plan.weeklyTargetHours} Hours</h2>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500">Completed Time:</span>
            <span className="text-xl font-black text-indigo-600 block">
              {plan.completedHours} / {plan.weeklyTargetHours} Hours ({completionPct}%)
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, completionPct)}%` }}
          />
        </div>

        {/* Target Companies & Focus Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <span className="font-bold text-indigo-950 block mb-1">Target Recruitment Drives:</span>
            <div className="flex flex-wrap gap-1">
              {(plan.targetDrives || []).map((td, i) => (
                <span key={i} className="bg-white text-indigo-700 px-2 py-0.5 rounded-md font-semibold border border-indigo-200">
                  {td}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <span className="font-bold text-purple-950 block mb-1">Diagnostic Weak Topic Focus:</span>
            <div className="flex flex-wrap gap-1">
              {(plan.focusAreas || []).map((fa, i) => (
                <span key={i} className="bg-white text-purple-700 px-2 py-0.5 rounded-md font-semibold border border-purple-200">
                  {fa}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Tasks List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          <span>Daily Actionable Tasks</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {(plan.tasks || []).map((task) => (
            <div
              key={task._id}
              onClick={() => handleToggleTask(task._id)}
              className="py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 px-2 rounded-2xl transition-all"
            >
              <div className="flex items-center space-x-3.5">
                <button
                  type="button"
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    task.isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-slate-300 text-transparent hover:border-indigo-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 fill-white" />
                </button>

                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase">{task.day}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                      task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Category: {task.category} • Target Company: {task.relatedCompany || 'General'}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-600 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.durationMinutes} mins</span>
                </span>
                <span className={`text-[10px] font-semibold block ${task.isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {task.isCompleted ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
