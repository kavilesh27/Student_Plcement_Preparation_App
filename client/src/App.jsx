import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AccessDenied from './pages/auth/AccessDenied';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CompanyDrives from './pages/student/CompanyDrives';
import CompanyPrepDetail from './pages/student/CompanyPrepDetail';
import DailyTests from './pages/student/DailyTests';
import CodingPractice from './pages/student/CodingPractice';
import ResumeAssessment from './pages/student/ResumeAssessment';
import StudentProgress from './pages/student/StudentProgress';
import TrainingLMS from './pages/student/TrainingLMS';
import StudyPlanner from './pages/student/StudyPlanner';
import StudentProfile from './pages/student/StudentProfile';
import NotificationsPage from './pages/student/NotificationsPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StudentRoster from './pages/staff/StudentRoster';
import SupportStudents from './pages/staff/SupportStudents';
import CompanyManagement from './pages/staff/CompanyManagement';
import StaffReports from './pages/staff/StaffReports';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import AuditLogs from './pages/admin/AuditLogs';
import PlatformSettings from './pages/admin/PlatformSettings';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their own role dashboard
    const home = user.role === 'admin' ? '/admin/dashboard' : user.role === 'staff' ? '/staff/dashboard' : '/student/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
};

// Root index redirector
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="companies" element={<CompanyDrives />} />
            <Route path="companies/:id" element={<CompanyPrepDetail />} />
            <Route path="daily-tests" element={<DailyTests />} />
            <Route path="coding" element={<CodingPractice />} />
            <Route path="resume-assessment" element={<ResumeAssessment />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="training" element={<TrainingLMS />} />
            <Route path="study-plan" element={<StudyPlanner />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Staff Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="companies" element={<CompanyManagement />} />
            <Route path="students" element={<StudentRoster />} />
            <Route path="tests" element={<DailyTests />} />
            <Route path="support" element={<SupportStudents />} />
            <Route path="training" element={<TrainingLMS />} />
            <Route path="reports" element={<StaffReports />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<UserManagement />} />
            <Route path="staff" element={<UserManagement />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="companies" element={<CompanyManagement />} />
            <Route path="assessments" element={<DailyTests />} />
            <Route path="training" element={<TrainingLMS />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<PlatformSettings />} />
          </Route>

          {/* Access Denied & Default Routes */}
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
