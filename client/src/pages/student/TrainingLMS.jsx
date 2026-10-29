import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  PlayCircle,
  Award,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { trainingAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TrainingLMS() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const categories = [
    'All',
    'C Programming',
    'Data Structures & Algorithms',
    'Quantitative Aptitude',
    'Technical Interview',
    'Java Programming',
    'OOP Concepts',
  ];

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await trainingAPI.getCourses({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCourse = async (courseId) => {
    try {
      const res = await trainingAPI.getCourseById(courseId);
      if (res.data.success) {
        setSelectedCourse(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    if (!selectedCourse) return;
    setMarkingId(lessonId);
    try {
      const res = await trainingAPI.completeLesson(selectedCourse.course._id, lessonId);
      if (res.data.success) {
        setSelectedCourse((prev) => ({
          ...prev,
          progress: res.data.data,
        }));
        // Update main list
        setCourses((prev) =>
          prev.map((c) =>
            c._id === selectedCourse.course._id
              ? { ...c, progressPercentage: res.data.data.completionPercentage }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading placement training courses & structured modules..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>Advanced Placement Training LMS</span>
          </h1>
          <p className="text-xs text-slate-500">
            Structured curriculum across programming languages, Core CS subjects, aptitude, and interview preparation.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {course.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center space-x-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{course.estimatedDurationHours} hrs</span>
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base">{course.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Curriculum Progress</span>
                  <span className="font-bold text-indigo-600">{course.progressPercentage || 0}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${course.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenCourse(course._id)}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1"
            >
              <span>View Curriculum & Lessons</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                  {selectedCourse.course.category} • {selectedCourse.course.difficulty}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{selectedCourse.course.title}</h2>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>Overall Completed: <strong className="text-indigo-600">{selectedCourse.progress?.completionPercentage || 0}%</strong></span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modules and Lessons */}
            <div className="space-y-4">
              {selectedCourse.course.modules?.map((mod) => (
                <div key={mod._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-xs flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      {mod.moduleNumber}
                    </span>
                    <span>{mod.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500">{mod.description}</p>

                  <div className="space-y-2 pt-1">
                    {mod.lessons?.map((les) => {
                      const isDone = selectedCourse.progress?.completedLessons?.some(
                        (l) => l.lessonId?.toString() === les._id?.toString()
                      );

                      return (
                        <div
                          key={les._id}
                          className="p-3 bg-white rounded-xl border border-slate-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{les.title}</span>
                            </span>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{les.content}</p>
                          </div>

                          <button
                            onClick={() => handleCompleteLesson(les._id)}
                            disabled={markingId === les._id}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] shrink-0 transition-all flex items-center space-x-1 ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedCourse(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
            >
              Close Course Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
