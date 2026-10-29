import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Award,
  Github,
  Linkedin,
  Building,
  Flame,
  CheckCircle2,
  Sparkles,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    CGPA: user?.CGPA || 7.5,
    backlogStatus: user?.backlogStatus || 'No Backlogs',
    activeBacklogsCount: user?.activeBacklogsCount || 0,
    github: user?.profileDetails?.github || '',
    linkedin: user?.profileDetails?.linkedin || '',
    bio: user?.profileDetails?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        CGPA: Number(formData.CGPA),
        backlogStatus: formData.backlogStatus,
        activeBacklogsCount: Number(formData.activeBacklogsCount),
        profileDetails: {
          ...profile?.profileDetails,
          bio: formData.bio,
          github: formData.github,
          linkedin: formData.linkedin,
        },
      });

      if (res.data.success) {
        setProfile(res.data.user);
        setEditing(false);
        alert('Profile details updated successfully.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            {profile?.name?.charAt(0) || 'S'}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{profile?.name}</h1>
            <p className="text-xs text-slate-500 font-medium">
              {profile?.studentId} • {profile?.department}
            </p>
            <div className="flex items-center space-x-3 text-xs text-indigo-600 font-bold pt-1">
              <span>CGPA: {profile?.CGPA}</span>
              <span>•</span>
              <span className="text-emerald-600">{profile?.backlogStatus}</span>
              <span>•</span>
              <span className="text-amber-600 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{profile?.currentStreak || 1} Day Streak</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {editing ? (
        /* Edit Form */
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Update Placement Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.CGPA}
                onChange={(e) => setFormData({ ...formData, CGPA: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Backlog Status</label>
              <select
                value={formData.backlogStatus}
                onChange={(e) => setFormData({ ...formData, backlogStatus: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl outline-none"
              >
                <option value="No Backlogs">No Backlogs</option>
                <option value="Active Backlogs">Active Backlogs</option>
                <option value="Cleared Backlogs">Cleared Backlogs</option>
                <option value="Pending Verification">Pending Verification</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">GitHub Profile URL</label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">Bio</label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      ) : (
        /* Academic Details & Portfolio Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Academic Credentials</span>
            </h3>
            <div className="space-y-2 text-slate-600 divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-900">{profile?.department}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Class & Semester:</span>
                <span className="font-semibold text-slate-900">{profile?.academicYear} (Sem {profile?.semester})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Batch Year:</span>
                <span className="font-semibold text-slate-900">{profile?.graduationYear}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">CGPA:</span>
                <span className="font-bold text-indigo-600">{profile?.CGPA}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Backlogs Status:</span>
                <span className="font-semibold text-slate-800">{profile?.backlogStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Achievement Badges Earned</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {(profile?.badges || []).map((b, i) => (
                <div key={i} className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-white text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <strong className="block text-slate-900 text-[11px] font-bold">{b.title}</strong>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{b.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
