import api from './axios';

export const authApi = {
  googleLogin: (credential) => api.post('/api/v1/auth/google', { credential }),
};
