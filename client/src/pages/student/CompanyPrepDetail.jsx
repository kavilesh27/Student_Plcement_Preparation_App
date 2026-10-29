import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Layers,
  Clock,
  BookOpen,
  CheckCircle2,
  FileCheck,
  Code2,
  PlayCircle,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CompanyPrepDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrep = async () => {
      try {
        const res = await studentAPI.getCompanyPrep(id);
        if (res.data.success) {
          setPrepData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load company preparation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrep();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading round-by-round recruitment preparation syllabus..." />;
  if (!prepData) return <div className="p-8 text-center text-slate-500">Recruitment drive not found.</div>;

  const { company, eligibility, recruitmentRounds } = prepData;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/companies')}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to All Recruitment Drives</span>
      </button>

      {/* Company Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <img
            src={company.logo}
            alt={company.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{company.name}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {company.recruitmentRounds?.length || 3} Selection Stages
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
              {company.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span>Drive: <strong className="text-slate-800">{new Date(company.driveDate).toLocaleDateString()}</strong></span>
              <span>•</span>
              <span>Role: <strong className="text-indigo-600">{company.jobRoles?.[0]?.title}</strong></span>
              <span>•</span>
              <span>Salary: <strong className="text-emerald-700">{company.jobRoles?.[0]?.packageLPA}</strong></span>
            </div>
          </div>
        </div>

        {/* Eligibility Pill */}
        <div className="shrink-0 text-left md:text-right space-y-1">
          <span
            className={`inline-block text-xs font-bold px-3 py-1.5 rounded-xl border ${
              eligibility.eligibilityStatus === 'Eligible based on recorded criteria'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : eligibility.eligibilityStatus === 'Needs verification'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {eligibility.eligibilityStatus}
          </span>
          <p className="text-[10px] text-slate-400">Min CGPA: {company.eligibilityCriteria?.minCGPA || 6.5}</p>
        </div>
      </div>

      {/* Rounds Roadmap & Syllabus */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Configured Selection Process & Preparation Roadmap</span>
          </h2>
          <span className="text-xs text-slate-500">Configured by University Placement Staff</span>
        </div>

        <div className="space-y-4">
          {recruitmentRounds.map((round) => (
            <div
              key={round.roundNumber}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all space-y-4"
            >
              {/* Round Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    R{round.roundNumber}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{round.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-600">{round.type}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{round.timeLimitMinutes || 45} Minutes</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Past Score</span>
                    <span className="text-xs font-bold text-slate-800">{round.previousScore}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      round.completionStatus === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : round.completionStatus === 'Attempted'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {round.completionStatus}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600">{round.description}</p>

              {/* Topics to prepare */}
              {round.topics && round.topics.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Topics to Prepare:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {round.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold bg-indigo-50/70 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Preparation Plan */}
              {round.suggestedPreparationPlan && (
                <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 border border-slate-100 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Recommended Prep Strategy:</strong>
                    <span>{round.suggestedPreparationPlan}</span>
                  </div>
                </div>
              )}

              {/* Learning Materials & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                {round.materials && round.materials.length > 0 ? (
                  <div className="flex items-center space-x-2 text-xs">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 font-medium">Resources:</span>
                    <a
                      href={round.materials[0].url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 font-bold hover:underline inline-flex items-center space-x-1"
                    >
                      <span>{round.materials[0].title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Standard syllabus materials linked above</div>
                )}

                <button
                  onClick={() => {
                    if (round.type === 'Coding') navigate('/student/coding');
                    else navigate('/student/daily-tests');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start Practice For This Round</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
