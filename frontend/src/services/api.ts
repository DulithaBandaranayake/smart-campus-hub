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
};

export const userService = {
  getAll: (role?: string) => apiClient.get('/users', { params: role ? { role } : {} }),
  getById: (id: number) => apiClient.get(`/users/${id}`),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: number, data: any) => apiClient.put(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
};

export const subjectService = {
  getAll: (params?: { gradeLevel?: string; lecturerId?: number }) =>
    apiClient.get('/subjects', { params }),
  getById: (id: number) => apiClient.get(`/subjects/${id}`),
  create: (data: any) => apiClient.post('/subjects', data),
  update: (id: number, data: any) => apiClient.put(`/subjects/${id}`, data),
  delete: (id: number) => apiClient.delete(`/subjects/${id}`),
};

export const markService = {
  getAll: (params?: { studentId?: number; subjectId?: number }) =>
    apiClient.get('/marks', { params }),
  create: (data: any) => apiClient.post('/marks', data),
  update: (id: number, data: any) => apiClient.put(`/marks/${id}`, data),
  delete: (id: number) => apiClient.delete(`/marks/${id}`),
};

export const leaveService = {
  getAll: (params?: { studentId?: number; parentId?: number; status?: string }) =>
    apiClient.get('/leaves', { params }),
  getPendingForParent: (parentId: number) => apiClient.get(`/leaves/pending-parent/${parentId}`),
  create: (data: any) => apiClient.post('/leaves', data),
  parentReview: (id: number, approved: boolean, comment?: string) =>
    apiClient.put(`/leaves/${id}/parent-review`, null, { params: { approved, comment: comment || '' } }),
  adminReview: (id: number, approved: boolean, comment?: string) =>
    apiClient.put(`/leaves/${id}/admin-review`, null, { params: { approved, comment: comment || '' } }),
  delete: (id: number) => apiClient.delete(`/leaves/${id}`),
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

export default apiClient;
