import api from './axios';

export const equipmentApi = {
  getAvailableForRoom: (excludeRoomId) =>
    api.get('/api/v1/equipment', { params: { excludeRoomId } }),
  getAll: () =>
    api.get('/api/v1/equipment'),
};
