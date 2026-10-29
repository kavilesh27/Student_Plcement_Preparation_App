import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('placement_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('placement_token');
      localStorage.removeItem('placement_user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Student APIs
export const studentAPI = {
  getDashboard: () => api.get('/students/dashboard'),
  getReadiness: () => api.get('/students/readiness'),
  getCompanyDrives: () => api.get('/students/company-drives'),
  getCompanyPrep: (id) => api.get(`/students/company-drives/${id}/prep`),
  getTestHistory: () => api.get('/students/test-history'),
  getStudyPlan: () => api.get('/students/study-plan'),
  toggleStudyTask: (taskId) => api.put(`/students/study-plan/tasks/${taskId}`),
};

// Company APIs
export const companyAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

// Assessment APIs
export const assessmentAPI = {
  getAll: (params) => api.get('/assessments', { params }),
  getById: (id) => api.get(`/assessments/${id}`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
  create: (data) => api.post('/assessments', data),
};

// Coding Practice APIs
export const codingAPI = {
  getProblems: (params) => api.get('/coding/problems', { params }),
  getProblemById: (id) => api.get(`/coding/problems/${id}`),
  submit: (data) => api.post('/coding/submit', data),
  getSubmissions: () => api.get('/coding/submissions'),
};

// Resume and AI APIs
export const resumeAPI = {
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getActive: () => api.get('/resumes/active'),
  confirmSkills: (id, data) => api.put(`/resumes/${id}/confirm-skills`, data),
  generateQuestions: (id, data) => api.post(`/resumes/${id}/generate-questions`, data),
  submitAssessment: (id, data) => api.post(`/resumes/question-sets/${id}/submit`, data),
  flagQuestion: (qId, data) => api.put(`/resumes/questions/${qId}/flag`, data),
};

// Staff APIs
export const staffAPI = {
  getDashboard: () => api.get('/staff/dashboard'),
  getStudents: (params) => api.get('/staff/students', { params }),
  getStudentsNeedingSupport: () => api.get('/staff/students-needing-support'),
  assignSupport: (data) => api.post('/staff/assign-support', data),
  exportReportUrl: (format) => `/api/staff/reports/export?format=${format}`,
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
};

// Training LMS APIs
export const trainingAPI = {
  getCourses: (params) => api.get('/training/courses', { params }),
  getCourseById: (id) => api.get(`/training/courses/${id}`),
  completeLesson: (courseId, lessonId) => api.post(`/training/courses/${courseId}/lessons/${lessonId}/complete`),
};

// Notifications APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// Feedback APIs
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
};

export default api;
