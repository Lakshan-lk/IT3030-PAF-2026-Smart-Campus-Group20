import api from './axios';

export const userApi = {
  getAll: () => api.get('/api/v1/admin/users'),
  create: (data) => api.post('/api/v1/admin/users', data),
  update: (id, data) => api.put(`/api/v1/admin/users/${id}`, data),
  delete: (id) => api.delete(`/api/v1/admin/users/${id}`),
};
