import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  GraduationCap,
  CheckCircle,
  XCircle,
  Lock,
  Upload,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    role: 'student',
    studentId: '',
    department: 'Computer Science and Engineering',
    CGPA: 7.5,
    graduationYear: 2026,
    phoneNumber: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        role: selectedRole !== 'All' ? selectedRole : undefined,
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.accountStatus === 'active' ? 'inactive' : 'active';
    try {
      await adminAPI.updateUser(user._id, { accountStatus: newStatus });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, accountStatus: newStatus } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createUser(formData);
      if (res.data.success) {
        setModalOpen(false);
        fetchUsers();
        alert('User account created successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Fetching institutional student and staff user directories..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>User & Account Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Provision, review, and manage student, staff coordinator, and administrator access credentials.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, roll no..."
            className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 w-64"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="All">All User Roles</option>
          <option value="student">Students</option>
          <option value="staff">Placement Staff</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">CGPA / Details</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-4 text-right">Toggle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : u.role === 'staff'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {u.department?.replace('Engineering', 'Eng.').replace('Computer Science and', 'CSE')}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-bold">
                    {u.role === 'student' ? `${u.CGPA} CGPA (${u.studentId})` : 'Faculty / Lead'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.accountStatus === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        u.accountStatus === 'active'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Provision New Account</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="student">Student</option>
                  <option value="staff">Placement Staff Coordinator</option>
                  <option value="admin">Institutional Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              {formData.role === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="STU2026..."
                      className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.CGPA}
                      onChange={(e) => setFormData({ ...formData, CGPA: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Simulation Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <Upload className="w-10 h-10 text-indigo-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Bulk Student CSV Import</h3>
            <p className="text-xs text-slate-500">
              Upload standard college CSV with columns: `name, studentId, email, department, cgpa, graduationYear`.
            </p>
            <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 block cursor-pointer text-xs font-semibold text-slate-600 hover:border-indigo-400">
              Click to select CSV file
              <input type="file" accept=".csv" className="hidden" onChange={() => {
                alert('Sample batch records successfully staged. 20 records validated.');
                setImportModalOpen(false);
              }} />
            </label>
            <button
              onClick={() => setImportModalOpen(false)}
              className="w-full py-2 bg-slate-100 font-bold text-slate-700 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
