import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  Award,
  CheckCircle,
  Eye,
  ChevronRight
} from 'lucide-react';
import { staffAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StudentRoster() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, selectedCategory]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getStudents({
        department: selectedDept !== 'All' ? selectedDept : undefined,
        performanceCategory: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading searchable student placement roster..." />;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Student Placement Performance Monitoring</span>
          </h1>
          <p className="text-xs text-slate-500">
            Searchable roster of all registered undergraduate students, tracking tests, readiness, and performance categories.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 w-48"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science and Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics and Communication Engineering">ECE</option>
            <option value="Artificial Intelligence and Data Science">AI & DS</option>
            <option value="Mechanical Engineering">Mech</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Top Performer">Top Performers</option>
            <option value="On Track">On Track</option>
            <option value="Needs Support">Needs Support</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Student ID & Name</th>
                <th className="py-3.5 px-3">Department</th>
                <th className="py-3.5 px-3">CGPA</th>
                <th className="py-3.5 px-3">Tests Done</th>
                <th className="py-3.5 px-3">Avg Score</th>
                <th className="py-3.5 px-3">Coding Score</th>
                <th className="py-3.5 px-3">Readiness %</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 block">{s.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{s.studentId}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {s.department.replace('Engineering', 'Eng.').replace('Computer Science and', 'CSE')}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{s.CGPA}</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{s.dailyTestCount}</td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">{s.averageTestScore}%</td>
                  <td className="py-3 px-3 font-bold text-indigo-600">{s.codingScore}%</td>
                  <td className="py-3 px-3">
                    <span className="font-black text-indigo-700 text-sm">{s.placementReadiness}%</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.category === 'Top Performer'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : s.category === 'Needs Support'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500">{selectedStudent.studentId} • {selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Placement Readiness</span>
                <span className="text-xl font-black text-indigo-600">{selectedStudent.placementReadiness}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Cumulative CGPA</span>
                <span className="text-xl font-black text-slate-900">{selectedStudent.CGPA}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Coding Performance</span>
                <span className="text-base font-bold text-slate-800">{selectedStudent.codingScore}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Aptitude Score</span>
                <span className="text-base font-bold text-slate-800">{selectedStudent.aptitudeScore}%</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 p-3 bg-slate-50 rounded-xl">
              <div className="flex justify-between">
                <span>Department:</span>
                <strong className="text-slate-800">{selectedStudent.department}</strong>
              </div>
              <div className="flex justify-between">
                <span>Academic Standing:</span>
                <strong className="text-slate-800">{selectedStudent.academicYear}</strong>
              </div>
              <div className="flex justify-between">
                <span>Backlog Status:</span>
                <strong className="text-slate-800">{selectedStudent.backlogStatus}</strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
