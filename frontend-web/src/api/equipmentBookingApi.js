import api from './axios';

export const equipmentBookingApi = {
  getAll: (params = {}) => api.get('/api/v1/equipment-bookings', { params }),

  getById: (id) => api.get(`/api/v1/equipment-bookings/${id}`),

  create: (data) => api.post('/api/v1/equipment-bookings', data),

  approve: (id) => api.put(`/api/v1/equipment-bookings/${id}/approve`),

  reject: (id, reason) => api.put(`/api/v1/equipment-bookings/${id}/reject`, { reason }),

  cancel: (id) => api.post(`/api/v1/equipment-bookings/${id}/cancel`),

  getActiveCount: () => api.get('/api/v1/equipment-bookings/stats/active'),
};
