// Central place for auth helpers so you don't sprinkle localStorage calls everywhere

//V09 : Token no longer persisted to localStorage. (patient/doctor/payment/auth-service: browser sends the httpOnly cookie automatically (check axiosClient.js withCredentials) - appointment/telemedicine-service (still Bearer-header auth): token kept in memory only, cleared on refresh.)

let inMemoryToken = null;

export const setToken = (token) => { inMemoryToken = token; };
export const getToken = () => inMemoryToken;

export const getUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

//isAuthenticated can't rely on the in-memory token alone, since a cookie-authenticated user has none here. Fall back to `user`. (V09)
export const isAuthenticated = () => !!getToken() || !!getUser();

export const logout = () => {
  inMemoryToken = null;
  localStorage.removeItem('user');
};