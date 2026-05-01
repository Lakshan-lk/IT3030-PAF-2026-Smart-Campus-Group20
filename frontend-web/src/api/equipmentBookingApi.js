import api from './axios';

export const equipmentBookingApi = {
    create: (data) => api.post('/api/v1/equipment-bookings', data),
    getAll: (params) => api.get('/api/v1/equipment-bookings', { params }),
    getMyBookings: (params) => api.get('/api/v1/equipment-bookings/my-bookings', { params }),
    approve: (id) => api.put(`/api/v1/equipment-bookings/${id}/approve`),
    reject: (id, reason) => api.put(`/api/v1/equipment-bookings/${id}/reject`, { reason }),
    delete: (id) => api.delete(`/api/v1/equipment-bookings/${id}`)
};
