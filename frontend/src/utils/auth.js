// Central place for auth helpers so you don't sprinkle localStorage calls everywhere

export const getToken = () => localStorage.getItem('token');

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

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};