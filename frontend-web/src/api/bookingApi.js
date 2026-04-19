import api from './axios';

export const bookingApi = {
  getAll: (params = {}) => api.get('/api/v1/bookings', { params }),

  getById: (id) => api.get(`/api/v1/bookings/${id}`),

  create: (data) => api.post('/api/v1/bookings', data),

  update: (id, data) => api.put(`/api/v1/bookings/${id}`, data),

  approve: (id) => api.put(`/api/v1/bookings/${id}/approve`),

  reject: (id, reason) => api.put(`/api/v1/bookings/${id}/reject`, { reason }),

  cancel: (id) => api.post(`/api/v1/bookings/${id}/cancel`),

  delete: (id) => api.delete(`/api/v1/bookings/${id}`),

  getActiveCount: () => api.get('/api/v1/bookings/stats/active'),

  cancelSeries: (groupId) => api.post(`/api/v1/bookings/series/${groupId}/cancel`),
};
