import axiosClient from './axiosClient';

export const getProfile = () => axiosClient.get('/patients/profile');
export const createProfile = (data) => axiosClient.post('/patients/profile', data);
export const updateProfile = (data) => axiosClient.put('/patients/profile', data);

//In app notifications
export const getMyAppointments = () => axiosClient.get('/appointments/my-appointments');
export const getScheduledTelemedicine = () => axiosClient.get('/patients/scheduled-sessions');

export const updateAvatar = (formData) =>
  axiosClient.put('/patients/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
export const uploadReport = (formData) =>
  axiosClient.post('/patients/upload-report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteReport = (reportId) => 
  axiosClient.delete(`/patients/reports/${reportId}`);

export const getHistory = () => axiosClient.get('/patients/history');