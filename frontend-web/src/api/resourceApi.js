import api from './axios';

export const resourceApi = {
  getAll: (params = {}) => api.get('/api/v1/resources', { params }),

  getById: (id) => api.get(`/api/v1/resources/${id}`),

  create: (data) => api.post('/api/v1/resources', data),

  update: (id, data) => api.put(`/api/v1/resources/${id}`, data),

  delete: (id) => api.delete(`/api/v1/resources/${id}`),
};