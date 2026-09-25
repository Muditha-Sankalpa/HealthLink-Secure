import axios from 'axios';
import { getToken } from '../utils/auth';

const baseFromEnv = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const axiosClient = axios.create({
  baseURL: baseFromEnv ? `${baseFromEnv}/api` : 'http://localhost:5000/api',
  timeout: 20000,
});

// cookie-auth services need withCredentials; 
// appointment/telemedicine still need the in-memory Bearer token attached manually. (V09)
const COOKIE_AUTH_PATHS = ['/auth', '/patients', '/doctors', '/payment'];

axiosClient.interceptors.request.use((config) => {
  const usesCookieAuth = COOKIE_AUTH_PATHS.some((p) => config.url?.includes(p));
  if (usesCookieAuth) {
    config.withCredentials = true;
  } else {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;