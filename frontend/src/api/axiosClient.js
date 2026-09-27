import axios from 'axios';
import { getToken } from '../utils/auth';

const baseFromEnv = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const axiosClient = axios.create({
  baseURL: baseFromEnv ? `${baseFromEnv}/api` : 'http://localhost:5000/api',
  timeout: 20000,
  withCredentials: true, //always send the httpOnly cookie as a fallback
});

axiosClient.interceptors.request.use((config) => {
  // Always attach the header when we have an in-memory token, regardless of
  // path — a previous version skipped this for /auth, /patients, /doctors,
  // /payment on the assumption those routes rely solely on the httpOnly
  // cookie, but a normal email/password login never sets that cookie (only
  // the Google OAuth callback does), so that logic silently sent no valid
  // credential at all for non-OAuth users and broke every login.
  // Bearer users get both (server prefers header per each service's
  // authMiddleware — checks header first, cookie as fallback).
  // OAuth users fall back to the cookie since they have no in-memory token.
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;