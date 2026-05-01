import api from './axios';

export const authApi = {
  googleLogin: (credential) => api.post('/api/v1/auth/google', { credential }),
  localLogin: (username, password) => api.post('/api/v1/auth/local', { username, password }),
};
