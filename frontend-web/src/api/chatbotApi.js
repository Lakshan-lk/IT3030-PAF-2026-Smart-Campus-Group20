import api from './axios';

export const chatbotApi = {
  ask: (data) => api.post('/api/chatbot/ask', data),
};