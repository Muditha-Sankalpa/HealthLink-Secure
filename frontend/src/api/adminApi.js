import axiosClient from './axiosClient';

export const getAllPatients = (search = '') => axiosClient.get(`/patients/all${search ? `?search=${search}` : ''}`);
export const getStats = () => axiosClient.get('/patients/stats');
export const updatePatientStatus = (id, status) => axiosClient.put(`/patients/${id}/status`, { status });