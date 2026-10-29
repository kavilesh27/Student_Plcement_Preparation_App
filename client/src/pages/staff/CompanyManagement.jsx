import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Award,
  ExternalLink,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { companyAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60',
    jobRoleTitle: 'Software Engineer',
    packageLPA: '6.5 - 9.0 LPA',
    description: '',
    driveDate: '',
    registrationDeadline: '',
    minCGPA: 6.5,
    allowedDepartments: ['Computer Science and Engineering', 'Information Technology'],
    maxActiveBacklogs: 0,
    requiredSkills: 'Java, C++, Data Structures',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyAPI.getAll();
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60',
      jobRoleTitle: 'Graduate Software Engineer',
      packageLPA: '6.5 - 9.0 LPA',
      description: 'Campus recruitment drive for 2026 engineering batch.',
      driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minCGPA: 6.5,
      allowedDepartments: ['Computer Science and Engineering', 'Information Technology'],
      maxActiveBacklogs: 0,
      requiredSkills: 'Java, Data Structures, Problem Solving',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        logo: formData.logo,
        jobRoles: [{ title: formData.jobRoleTitle, packageLPA: formData.packageLPA }],
        description: formData.description,
        driveDate: new Date(formData.driveDate),
        registrationDeadline: new Date(formData.registrationDeadline),
        eligibilityCriteria: {
          minCGPA: Number(formData.minCGPA),
          allowedDepartments: formData.allowedDepartments,
          graduationYears: [2026],
          maxActiveBacklogs: Number(formData.maxActiveBacklogs),
        },
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()),
        status: 'published',
      };

      if (editingCompany) {
        await companyAPI.update(editingCompany._id, payload);
      } else {
        await companyAPI.create(payload);
      }

      setModalOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert('Error saving company drive');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recruitment drive? This will remove all associated eligibility calculations.')) return;
    try {
      await companyAPI.delete(id);
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading campus company drives management catalog..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>Campus Recruitment Drives Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure upcoming company drives, recruitment rounds, syllabus topics, and academic eligibility criteria.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Drive</span>
        </button>
      </div>

      {/* Drives Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((comp) => (
          <div
            key={comp._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <img
                  src={comp.logo}
                  alt={comp.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDelete(comp._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{comp.name}</h3>
                <p className="text-xs font-semibold text-slate-600">{comp.jobRoles?.[0]?.title}</p>
                <span className="text-xs font-bold text-indigo-600">{comp.jobRoles?.[0]?.packageLPA}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Drive Date:</span>
                  <strong className="text-slate-800">{new Date(comp.driveDate).toLocaleDateString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Min CGPA:</span>
                  <strong className="text-slate-800">{comp.eligibilityCriteria?.minCGPA || 6.5}+</strong>
                </div>
                <div className="flex justify-between">
                  <span>Recruitment Rounds:</span>
                  <strong className="text-slate-800">{comp.recruitmentRounds?.length || 3} Stages</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              Allowed: {comp.eligibilityCriteria?.allowedDepartments?.slice(0, 2).join(', ') || 'All Departments'}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Drive Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingCompany ? 'Edit Recruitment Drive' : 'Publish New Recruitment Drive'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 p-1 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Google India / Amazon"
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    value={formData.jobRoleTitle}
                    onChange={(e) => setFormData({ ...formData, jobRoleTitle: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Salary Package (LPA)</label>
                  <input
                    type="text"
                    value={formData.packageLPA}
                    onChange={(e) => setFormData({ ...formData, packageLPA: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Recruitment Drive Date</label>
                  <input
                    type="date"
                    required
                    value={formData.driveDate}
                    onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Registration Closes</label>
                  <input
                    type="date"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Minimum CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.minCGPA}
                    onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Active Backlogs Allowed</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxActiveBacklogs}
                    onChange={(e) => setFormData({ ...formData, maxActiveBacklogs: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Drive Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow-xs"
                >
                  Save & Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
