import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  ArrowRight,
  Filter,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CompanyDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDriveForModal, setSelectedDriveForModal] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await studentAPI.getCompanyDrives();
        if (res.data.success) {
          setDrives(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load company drives:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching campus recruitment drives and evaluating eligibility..." />;

  const filtered = drives.filter(item => {
    const c = item.company;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.jobRoles?.some(r => r.title.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept === 'All' ||
      c.eligibilityCriteria?.allowedDepartments?.includes(selectedDept) ||
      c.eligibilityCriteria?.allowedDepartments?.includes('All');

    const matchesStatus = selectedStatus === 'All' ||
      (selectedStatus === 'Eligible' && item.eligibilityStatus === 'Eligible based on recorded criteria') ||
      (selectedStatus === 'Not Eligible' && item.eligibilityStatus === 'Not eligible') ||
      (selectedStatus === 'Needs Verification' && item.eligibilityStatus === 'Needs verification');

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>Campus Recruitment Drives</span>
          </h1>
          <p className="text-xs text-slate-500">
            Official drives configured by university placement staff. Compare your profile against recorded criteria.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company or role..."
              className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 w-52"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="All">All Eligibility</option>
            <option value="Eligible">Eligible Only</option>
            <option value="Not Eligible">Not Eligible</option>
            <option value="Needs Verification">Needs Verification</option>
          </select>
        </div>
      </div>

      {/* Grid of Company Drives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const comp = item.company;
          const isEligible = item.eligibilityStatus === 'Eligible based on recorded criteria';
          const isVerification = item.eligibilityStatus === 'Needs verification';

          return (
            <div
              key={comp._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header: Logo, Name, Eligibility Badge */}
                <div className="flex items-start justify-between">
                  <img
                    src={comp.logo}
                    alt={comp.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
                  />
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isVerification
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isEligible ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isVerification ? (
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{isEligible ? 'Eligible' : isVerification ? 'Needs Verification' : 'Not Eligible'}</span>
                    </span>
                    <button
                      onClick={() => setSelectedDriveForModal(item)}
                      className="block text-[10px] text-indigo-600 hover:underline font-semibold mt-1"
                    >
                      View Criteria Check
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{comp.name}</h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {comp.jobRoles?.[0]?.title || 'Software Trainee'}
                  </p>
                  <p className="text-xs font-bold text-indigo-600 mt-0.5">
                    Package: {comp.jobRoles?.[0]?.packageLPA || 'Competitive'}
                  </p>
                </div>

                {/* Criteria Snippets */}
                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Drive Date:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(comp.driveDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Registration Closes:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(comp.registrationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Min CGPA Required:</span>
                    <span className="font-semibold text-slate-800">
                      {comp.eligibilityCriteria?.minCGPA || 6.5}+
                    </span>
                  </div>
                </div>

                {/* Skills Required Pills */}
                {comp.requiredSkills && comp.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {comp.requiredSkills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedDriveForModal(item)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
                >
                  Eligibility Details
                </button>
                <button
                  onClick={() => navigate(`/student/companies/${comp._id}`)}
                  className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1"
                >
                  <span>Prepare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Criteria Breakdown Modal */}
      {selectedDriveForModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedDriveForModal.company.logo}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {selectedDriveForModal.company.name}
                  </h3>
                  <p className="text-xs text-slate-500">Official Criteria Verification</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriveForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Overall Verdict Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center space-x-3 ${
                selectedDriveForModal.eligibilityStatus === 'Eligible based on recorded criteria'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : selectedDriveForModal.eligibilityStatus === 'Needs verification'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {selectedDriveForModal.eligibilityStatus === 'Eligible based on recorded criteria' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : selectedDriveForModal.eligibilityStatus === 'Needs verification' ? (
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="font-bold text-xs block">
                  Status: {selectedDriveForModal.eligibilityStatus}
                </span>
                <span className="text-[11px] opacity-90">
                  Evaluated on {new Date(selectedDriveForModal.evaluatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Individual Criteria Rows */}
            <div className="space-y-3 text-xs">
              {/* CGPA */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">CGPA Requirement</span>
                  <span className="text-slate-500">
                    {selectedDriveForModal.criteriaResults?.cgpa?.reason}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                    selectedDriveForModal.criteriaResults?.cgpa?.status === 'Met'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedDriveForModal.criteriaResults?.cgpa?.status}
                </span>
              </div>

              {/* Department */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Department Requirement</span>
                  <span className="text-slate-500">
                    {selectedDriveForModal.criteriaResults?.department?.reason}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                    selectedDriveForModal.criteriaResults?.department?.status === 'Met'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedDriveForModal.criteriaResults?.department?.status}
                </span>
              </div>

              {/* Backlogs */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Backlog Criteria</span>
                  <span className="text-slate-500">
                    {selectedDriveForModal.criteriaResults?.backlogs?.reason}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                    selectedDriveForModal.criteriaResults?.backlogs?.status === 'Met'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedDriveForModal.criteriaResults?.backlogs?.status === 'Needs Verification'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedDriveForModal.criteriaResults?.backlogs?.status}
                </span>
              </div>

              {/* Skills */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Required Skills</span>
                  <span className="text-slate-500">
                    {selectedDriveForModal.criteriaResults?.skills?.reason}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-indigo-100 text-indigo-800 shrink-0">
                  {selectedDriveForModal.criteriaResults?.skills?.status}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/50 text-[11px] text-amber-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{selectedDriveForModal.disclaimer}</span>
            </div>

            <button
              onClick={() => setSelectedDriveForModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              Close Criteria Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
