import api from './axios';

export const ticketApi = {
  getAll: (params = {}) => api.get('/api/v1/tickets', { params }),
  getById: (id) => api.get(`/api/v1/tickets/${id}`),
  create: (data) => api.post('/api/v1/tickets', data),
  update: (id, data) => api.put(`/api/v1/tickets/${id}`, data),
  assign: (id, assigneeId) => api.put(`/api/v1/tickets/${id}/assign`, { assigneeId }),
  updateStatus: (id, data) => api.put(`/api/v1/tickets/${id}/status`, data),
  delete: (id) => api.delete(`/api/v1/tickets/${id}`),
  getComments: (ticketId) => api.get(`/api/v1/tickets/${ticketId}/comments`),
  addComment: (ticketId, data) => api.post(`/api/v1/tickets/${ticketId}/comments`, data),
  updateComment: (ticketId, commentId, data) => api.put(`/api/v1/tickets/${ticketId}/comments/${commentId}`, data),
  deleteComment: (ticketId, commentId, userId) =>
    api.delete(`/api/v1/tickets/${ticketId}/comments/${commentId}`, { params: { userId } }),
};
