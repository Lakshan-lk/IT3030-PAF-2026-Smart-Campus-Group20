import api from './axios';

export const userApi = {
  getAll: () => api.get('/api/v1/admin/users'),
  create: (data) => api.post('/api/v1/admin/users', data),
  getById: (id) => api.get(`/api/v1/users/${id}`),
};
