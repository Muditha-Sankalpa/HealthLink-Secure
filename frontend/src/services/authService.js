import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// LOGIN
export const loginUser = async (data) => {
  const res = await API.post("/api/auth/login", data);
  return res.data;
};

// REGISTER
export const registerUser = (data) => API.post("/api/auth/register", data);