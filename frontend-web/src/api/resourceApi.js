import api from './axios';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const resourceApi = {
  getAll: (params = {}) => api.get('/api/v1/resources', { params }),

  getById: (id) => api.get(`/api/v1/resources/${id}`),

  create: (data) => api.post('/api/v1/resources', data),

  update: (id, data) => api.put(`/api/v1/resources/${id}`, data),

  delete: (id) => api.delete(`/api/v1/resources/${id}`),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE_URL}/api/v1/resources/upload-image`, formData, {
      withCredentials: true,
    });
  },

  deleteUploadedImage: (imageUrl) => api.delete('/api/v1/resources/upload-image', {
    params: { imageUrl },
  }),
};
