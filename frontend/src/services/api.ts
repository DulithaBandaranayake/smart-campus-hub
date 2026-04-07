import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hubToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
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
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const resourceService = {
  getAll: () => apiClient.get('/resources'),
  getById: (id: number) => apiClient.get(`/resources/${id}`),
  create: (data: any) => apiClient.post('/resources', data),
  update: (id: number, data: any) => apiClient.put(`/resources/${id}`, data),
  delete: (id: number) => apiClient.delete(`/resources/${id}`),
  filter: (type: string) => apiClient.get(`/resources/filter?type=${type}`),
};

export const bookingService = {
  getAll: () => apiClient.get('/bookings'),
  getMy: (userId: string) => apiClient.get(`/bookings/my?userId=${userId}`),
  create: (data: any) => apiClient.post('/bookings', data),
  updateStatus: (id: number, status: string, reason?: string) => 
    apiClient.put(`/bookings/${id}/status?status=${status}${reason ? `&reason=${reason}` : ''}`),
  delete: (id: number) => apiClient.delete(`/bookings/${id}`),
};

export const ticketService = {
  getAll: () => apiClient.get('/tickets'),
  create: (data: any) => apiClient.post('/tickets', data),
  updateStatus: (id: number, status: string) => 
    apiClient.patch(`/tickets/${id}/status?status=${status}`),
  assign: (id: number, technicianId: string) => 
    apiClient.patch(`/tickets/${id}/assign?technicianId=${technicianId}`),
  addComment: (id: number, data: any) => apiClient.post(`/tickets/${id}/comments`, data),
  getComments: (id: number) => apiClient.get(`/tickets/${id}/comments`),
};

export const notificationService = {
  getMine: (userId: string) => apiClient.get(`/notifications?userId=${userId}`),
  getPublic: (query?: string, priority?: string) => 
    apiClient.get(`/notifications/public?${query ? `query=${query}` : ''}${priority ? `&priority=${priority}` : ''}`),
  create: (data: any) => apiClient.post('/notifications', data),
  update: (id: number, data: any) => apiClient.put(`/notifications/${id}`, data),
  markAsRead: (id: number) => apiClient.patch(`/notifications/${id}/read`),
  delete: (id: number) => apiClient.delete(`/notifications/${id}`),
};

export const authService = {
  login: (credentials: any) => apiClient.post('/auth/login', credentials),
  register: (data: any) => apiClient.post('/auth/register', data),
};

export default apiClient;
