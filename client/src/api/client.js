import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Tells Axios to include cookies in cross-origin requests
});

// Unified request wrapper matching the signature used by other API services
export const request = async (endpoint, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      data: options.body,
    };

    const response = await client(config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    console.error(`API Error in ${endpoint}:`, message);
    throw new Error(message);
  }
};
