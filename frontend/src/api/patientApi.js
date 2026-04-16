import axiosClient from './axiosClient';

export const getProfile = () => axiosClient.get('/patients/profile');
export const updateProfile = (data) => axiosClient.put('/patients/profile', data);
export const uploadReport = (formData) =>
  axiosClient.post('/patients/upload-report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getHistory = () => axiosClient.get('/patients/history');