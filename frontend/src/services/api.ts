import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hubToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('hubToken');
      localStorage.removeItem('hubUser');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials: any) => apiClient.post('/auth/login', credentials),
  register: (data: any) => apiClient.post('/auth/register', data),
  getGoogleAuthUrl: () => apiClient.get('/auth/google/url'),
  handleGoogleCallback: (code: string) => apiClient.post('/auth/google/callback', { code }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  requestPasswordReset: (email: string) => apiClient.post('/auth/request-password-reset', { email }),
  resetPassword: (token: string, password: string) => apiClient.post(`/auth/password-reset/${token}`, { password }),
};

export const userService = {
  getAll: (role?: string) => apiClient.get('/users', { params: role ? { role } : {} }),
  getById: (id: number) => apiClient.get(`/users/${id}`),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: number, data: any) => apiClient.put(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
  getPending: () => apiClient.get('/users/pending'),
  approve: (id: number) => apiClient.post(`/users/${id}/approve`),
  reject: (id: number) => apiClient.post(`/users/${id}/reject`),
  getPasswordResetRequests: () => apiClient.get('/users/password-reset-requests'),
  approvePasswordReset: (id: number) => apiClient.post(`/users/password-reset/${id}/approve`),
  rejectPasswordReset: (id: number) => apiClient.post(`/users/password-reset/${id}/reject`),
  resetPassword: (token: string, password: string) => apiClient.post(`/auth/password-reset/${token}`, { password }),
};

export const resourceService = {
  getAll: (params?: { type?: string; status?: string }) =>
    apiClient.get('/resources', { params }),
  getById: (id: number) => apiClient.get(`/resources/${id}`),
  create: (data: any) => apiClient.post('/resources', data),
  update: (id: number, data: any) => apiClient.put(`/resources/${id}`, data),
  delete: (id: number) => apiClient.delete(`/resources/${id}`),
};

export const bookingService = {
  getAll: (status?: string) => apiClient.get('/bookings', { params: status ? { status } : {} }),
  getMyBookings: (userId: string) => apiClient.get('/bookings/my', { params: { userId } }),
  create: (data: any) => apiClient.post('/bookings', data),
  updateStatus: (id: number, status: string, reason?: string) =>
    apiClient.put(`/bookings/${id}/status`, null, { params: { status, reason: reason || '' } }),
  delete: (id: number) => apiClient.delete(`/bookings/${id}`),
};

export const ticketService = {
  getAll: (status?: string) => apiClient.get('/tickets', { params: status ? { status } : {} }),
  getMyTickets: (reporterId: string) => apiClient.get('/tickets/my', { params: { reporterId } }),
  create: (data: any) => apiClient.post('/tickets', data),
  updateStatus: (id: number, status: string, resolutionNotes?: string) =>
    apiClient.patch(`/tickets/${id}/status`, null, { params: { status, resolutionNotes: resolutionNotes || '' } }),
  assignTechnician: (id: number, technicianId: string) =>
    apiClient.patch(`/tickets/${id}/assign`, null, { params: { technicianId } }),
  addResolutionNotes: (id: number, resolutionNotes: string) =>
    apiClient.patch(`/tickets/${id}/resolve`, null, { params: { resolutionNotes } }),
  getComments: (id: number) => apiClient.get(`/tickets/${id}/comments`),
  addComment: (id: number, data: any) => apiClient.post(`/tickets/${id}/comments`, data),
};

export const notificationService = {
  getAll: () => apiClient.get('/notifications', { params: {} }),
  getMy: (userId: string) => apiClient.get('/notifications', { params: { userId } }),
  create: (data: any) => apiClient.post('/notifications', data),
  markAsRead: (id: number) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: (userId: string) => apiClient.patch('/notifications/read-all', { params: { userId } }),
  delete: (id: number) => apiClient.delete(`/notifications/${id}`),
  getUnreadCount: (userId: string) => apiClient.get('/notifications/count', { params: { userId } }),
};

export const scheduleService = {
  getAll: (params?: { gradeLevel?: string; lecturerId?: number }) =>
    apiClient.get('/schedules', { params }),
  create: (data: any) => apiClient.post('/schedules', data),
  update: (id: number, data: any) => apiClient.put(`/schedules/${id}`, data),
  delete: (id: number) => apiClient.delete(`/schedules/${id}`),
};

export const attendanceService = {
  getAll: (params?: { studentId?: number; parentId?: number }) =>
    apiClient.get('/attendance', { params }),
  getSummary: (studentId: number) => apiClient.get(`/attendance/summary/${studentId}`),
  upsert: (data: any) => apiClient.post('/attendance', data),
  delete: (id: number) => apiClient.delete(`/attendance/${id}`),
};

export const markService = {
  getAll: (params?: { studentId?: number; subjectId?: number }) =>
    apiClient.get('/marks', { params }),
  create: (data: any) => apiClient.post('/marks', data),
  update: (id: number, data: any) => apiClient.put(`/marks/${id}`, data),
  delete: (id: number) => apiClient.delete(`/marks/${id}`),
};

export const subjectService = {
  getAll: (params?: { lecturerId?: number }) =>
    apiClient.get('/subjects', { params }),
  getById: (id: number) => apiClient.get(`/subjects/${id}`),
  create: (data: any) => apiClient.post('/subjects', data),
  update: (id: number, data: any) => apiClient.put(`/subjects/${id}`, data),
  delete: (id: number) => apiClient.delete(`/subjects/${id}`),
};

export const peopleService = {
  getStudents: () => apiClient.get('/people/students'),
  getStudentById: (id: number) => apiClient.get(`/people/students/${id}`),
  getStudentByEmail: (email: string) => apiClient.get(`/people/students/search?email=${encodeURIComponent(email)}`),
  getStudent: (id: number) => apiClient.get(`/people/students/${id}`),
  createStudent: (data: any) => apiClient.post('/people/students', data),
  updateStudent: (id: number, data: any) => apiClient.put(`/people/students/${id}`, data),
  deleteStudent: (id: number) => apiClient.delete(`/people/students/${id}`),
  
  getParents: () => apiClient.get('/people/parents'),
  getParent: (id: number) => apiClient.get(`/people/parents/${id}`),
  createParent: (data: any) => apiClient.post('/people/parents', data),
  updateParent: (id: number, data: any) => apiClient.put(`/people/parents/${id}`, data),
  deleteParent: (id: number) => apiClient.delete(`/people/parents/${id}`),
  
  getLecturers: () => apiClient.get('/people/lecturers'),
  getLecturer: (id: number) => apiClient.get(`/people/lecturers/${id}`),
  createLecturer: (data: any) => apiClient.post('/people/lecturers', data),
  updateLecturer: (id: number, data: any) => apiClient.put(`/people/lecturers/${id}`, data),
  deleteLecturer: (id: number) => apiClient.delete(`/people/lecturers/${id}`),
};

export const leaveRequestService = {
  getAll: () => apiClient.get('/leave-requests'),
  getByStudent: (studentId: number) => apiClient.get(`/leave-requests/student/${studentId}`),
  getByParent: (parentId: number) => apiClient.get(`/leave-requests/parent/${parentId}`),
  create: (data: any) => apiClient.post('/leave-requests', data),
  parentApprove: (id: number, comment: string) => 
    apiClient.post(`/leave-requests/${id}/parent-approve`, null, { params: { comment } }),
  parentReject: (id: number, comment: string) => 
    apiClient.post(`/leave-requests/${id}/parent-reject`, null, { params: { comment } }),
  adminApprove: (id: number, comment: string) => 
    apiClient.post(`/leave-requests/${id}/admin-approve`, null, { params: { comment } }),
  adminReject: (id: number, comment: string) => 
    apiClient.post(`/leave-requests/${id}/admin-reject`, null, { params: { comment } }),
  delete: (id: number) => apiClient.delete(`/leave-requests/${id}`),
};

export default apiClient;

export const statsService = {
  getDashboard: () => apiClient.get('/stats'),
  getWeekly: () => apiClient.get('/stats/weekly'),
  getMonthly: () => apiClient.get('/stats/monthly'),
};
