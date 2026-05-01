import api from './axios';

export const getAllNotifications = () => api.get('/api/v1/notifications/debug/all');
export const getNotifications = (userId) => api.get('/api/v1/notifications', { params: { userId } });
export const getUnreadNotifications = (userId) => api.get('/api/v1/notifications/unread', { params: { userId } });
export const getUnreadCount = (userId) => api.get('/api/v1/notifications/unread/count', { params: { userId } });
export const markAsRead = (notificationId) => api.put(`/api/v1/notifications/${notificationId}/read`);
export const markAllAsRead = (userId) => api.put('/api/v1/notifications/read-all', null, { params: { userId } });