import { request } from './client';

export const authApi = {
  register: async (name, email, password) => {
    return await request('/users/register', {
      method: 'POST',
      body: { name, email, password },
    });
  },

  login: async (email, password) => {
    return await request('/users/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  logout: async () => {
    return await request('/users/logout', { method: 'POST' });
  },

  getMe: async () => {
    return await request('/users/me', { method: 'GET' });
  },
};
