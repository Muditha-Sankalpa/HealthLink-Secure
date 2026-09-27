import axiosClient from '../api/axiosClient';

// LOGIN
export const loginUser = async (data) => {
  const res = await axiosClient.post("/auth/login", data);
  return res.data;
};

// REGISTER
export const registerUser = (data) => axiosClient.post("/auth/register", data);