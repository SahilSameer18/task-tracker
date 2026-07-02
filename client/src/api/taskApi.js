import { request } from './client';

export const taskApi = {
  getTasks: async ({ status, page, limit, search, sortBy } = {}) => {
    let query = '';
    const params = [];
    if (status && status !== 'All') params.push(`status=${encodeURIComponent(status)}`);
    if (page) params.push(`page=${page}`);
    if (limit) params.push(`limit=${limit}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (sortBy) params.push(`sortBy=${encodeURIComponent(sortBy)}`);
    
    if (params.length > 0) {
      query = `?${params.join('&')}`;
    }
    
    return await request(`/tasks${query}`, { method: 'GET' });
  },

  getStats: async () => {
    return await request('/tasks/stats', { method: 'GET' });
  },

  createTask: async (taskData) => {
    return await request('/tasks', {
      method: 'POST',
      body: taskData,
    });
  },

  updateTask: async (id, taskData) => {
    return await request(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData,
    });
  },

  deleteTask: async (id) => {
    return await request(`/tasks/${id}`, { method: 'DELETE' });
  },
};
