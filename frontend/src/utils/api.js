import axios from 'axios';

// All API calls go through this instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;