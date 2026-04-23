import api from './axios';

export const equipmentApi = {
  getAll: (params = {}) =>
    api.get('/api/v1/equipment', { params }),

  getAvailableForRoom: (excludeRoomId) =>
    api.get('/api/v1/equipment', { params: { excludeRoomId } }),

  getByRoom: (roomId) =>
    api.get(`/api/v1/resources/${roomId}/equipment`),

  create: (roomId, data) =>
    api.post(`/api/v1/resources/${roomId}/equipment`, data),

  update: (id, data) =>
    api.put(`/api/v1/equipment/${id}`, data),

  delete: (id) =>
    api.delete(`/api/v1/equipment/${id}`),
};
