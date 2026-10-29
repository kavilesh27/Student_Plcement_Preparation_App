import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  UserCheck,
  Send,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Phone
} from 'lucide-react';
import { staffAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SupportStudents() {
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentForIntervention, setSelectedStudentForIntervention] = useState(null);
  const [interventionData, setInterventionData] = useState({
    interventionType: 'Remedial Quiz',
    title: 'Diagnostic Pointer & Memory Remedial Module',
    notes: 'Please review module 1 on C memory allocation and retake the 10-question practice test before Friday.',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAtRisk();
  }, []);

  const fetchAtRisk = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getStudentsNeedingSupport();
      if (res.data.success) {
        setAtRiskList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load students needing support:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIntervention = async (e) => {
    e.preventDefault();
    if (!selectedStudentForIntervention) return;

    setSubmitting(true);
    try {
      const res = await staffAPI.assignSupport({
        studentId: selectedStudentForIntervention.student._id,
        ...interventionData,
      });

      if (res.data.success) {
        alert(res.data.message || 'Intervention assigned successfully.');
        setSelectedStudentForIntervention(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Analyzing at-risk students and diagnostic weakness patterns..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <span>Students Requiring Support (At-Risk Early Alert)</span>
        </h1>
        <p className="text-xs text-slate-500">
          Identifies students who scored below cutoff thresholds, missed mandatory daily tests, or exhibit repetitive topic weaknesses. Assign remedial modules and 1-on-1 mentoring.
        </p>
      </div>

      {/* Support List Cards */}
      <div className="space-y-4">
        {atRiskList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900">All Students On Track!</h3>
            <p className="text-xs text-slate-400 mt-1">No students currently meet the at-risk threshold.</p>
          </div>
        ) : (
          atRiskList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Student Info */}
              <div className="space-y-2 max-w-md">
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-slate-900 text-base">{item.student.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Needs Support
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-slate-700 font-semibold">{item.student.studentId}</span>
                  <span>•</span>
                  <span>{item.student.department}</span>
                  <span>•</span>
                  <span>CGPA: <strong className="text-slate-900">{item.student.CGPA}</strong></span>
                </div>

                {/* Score vs Cutoff */}
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <p>
                    Recent Test: <strong className="text-slate-800">{item.lastTestName}</strong> (Score: <span className="font-bold text-rose-600">{item.lastTestScore}%</span> / Cutoff: {item.requiredScore}%)
                  </p>
                  <p className="text-slate-500">
                    Missed Daily Tests: <strong className="text-amber-700">{item.missedDailyTests}</strong>
                  </p>
                </div>

                {/* Weak Topics */}
                {item.weakTopics && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.weakTopics.map((topic, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-100">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Intervention Action */}
              <div className="shrink-0 space-y-2 w-full md:w-auto text-left md:text-right">
                <div className="text-xs text-slate-500">
                  Recommended Action:
                  <strong className="block text-slate-900 font-bold">{item.recommendedIntervention}</strong>
                </div>

                <button
                  onClick={() => setSelectedStudentForIntervention(item)}
                  className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Assign Remedial Intervention</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Intervention Modal */}
      {selectedStudentForIntervention && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Assign Remedial Support</h3>
                <p className="text-xs text-slate-500">
                  To {selectedStudentForIntervention.student.name} ({selectedStudentForIntervention.student.studentId})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForIntervention(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignIntervention} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Intervention Type</label>
                <select
                  value={interventionData.interventionType}
                  onChange={(e) => setInterventionData({ ...interventionData, interventionType: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Remedial Quiz">Remedial Diagnostic Quiz</option>
                  <option value="Mandatory Course Module">Mandatory Training Course Module</option>
                  <option value="1-on-1 Faculty Mentoring">1-on-1 Faculty Mentoring Session</option>
                  <option value="Code Debugging Exercise">Targeted Code Debugging Practice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={interventionData.title}
                  onChange={(e) => setInterventionData({ ...interventionData, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mentor Guidance Notes</label>
                <textarea
                  rows={3}
                  required
                  value={interventionData.notes}
                  onChange={(e) => setInterventionData({ ...interventionData, notes: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Completion Deadline</label>
                <input
                  type="date"
                  value={interventionData.deadline}
                  onChange={(e) => setInterventionData({ ...interventionData, deadline: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForIntervention(null)}
                  className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Sending Alert...' : 'Dispatch Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
