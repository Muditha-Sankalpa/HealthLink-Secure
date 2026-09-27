import axios from 'axios';
import { getToken } from '../utils/auth';

const baseFromEnv = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const axiosClient = axios.create({
  baseURL: baseFromEnv ? `${baseFromEnv}/api` : 'http://localhost:5000/api',
  timeout: 20000,
  withCredentials: true, //always send the httpOnly cookie as a fallback
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;