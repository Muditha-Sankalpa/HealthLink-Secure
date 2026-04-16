import axios from 'axios';

const baseFromEnv = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const axiosClient = axios.create({
  baseURL: baseFromEnv ? `${baseFromEnv}/api` : 'http://localhost:5000/api',
  timeout: 20000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;