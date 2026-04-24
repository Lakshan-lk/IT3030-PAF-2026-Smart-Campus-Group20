import api from './axios';

export const userApi = {
  getAll: () => api.get('/api/v1/admin/users'),
  create: (data) => api.post('/api/v1/admin/users', data),
<<<<<<< HEAD
  update: (id, data) => api.put(`/api/v1/admin/users/${id}`, data),
  delete: (id) => api.delete(`/api/v1/admin/users/${id}`),
=======
  getById: (id) => api.get(`/api/v1/users/${id}`),
>>>>>>> b531ae34a82aad084bace72ebdb3165ae7c0edea
};
