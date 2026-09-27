import axios from 'axios';
import { getToken } from '../utils/auth';

const baseFromEnv = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const axiosClient = axios.create({
  baseURL: baseFromEnv ? `${baseFromEnv}/api` : 'http://localhost:5000/api',
  timeout: 20000,
  withCredentials: true, //always send the httpOnly cookie as a fallback
});

const COOKIE_AUTH_PATHS = ['/auth', '/patients', '/doctors', '/payment'];

axiosClient.interceptors.request.use((config) => {
  const usesCookieAuth = COOKIE_AUTH_PATHS.some((p) => config.url?.includes(p));

  if (!usesCookieAuth) {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // appointment/telemedicine now also get the cookie automatically via withCredentials above.
    // Bearer users get both (server prefers header),
    // OAuth users fall back to the cookie since they have no in-memory token.
  }
  return config;
});

export default axiosClient;