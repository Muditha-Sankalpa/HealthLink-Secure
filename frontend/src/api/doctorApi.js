import axiosClient from './axiosClient';

// --- Profile Management ---
export const getProfile = () => axiosClient.get('/doctors/profile');
export const createProfile = (data) => axiosClient.post('/doctors/profile', data);
export const updateProfile = (data) => axiosClient.put('/doctors/profile', data);
export const setAvailability = (data) => axiosClient.post('/doctors/availability', data);

// --- Appointments ---
export const getAppointments = () => axiosClient.get('/doctors/appointments');
export const updateAppointmentStatus = (id, status) => 
  axiosClient.put(`/doctors/appointments/${id}/status`, { status });
export const acceptConsultation = (appointmentId, accept) => 
  axiosClient.put(`/doctors/consultation/${appointmentId}/accept`, { accept });

// --- Prescriptions ---
export const issuePrescription = (data) => axiosClient.post('/doctors/prescription', data);
export const getPrescriptionHistory = () => axiosClient.get('/doctors/prescriptions/history');
export const getMyPrescriptions = () => axiosClient.get('/doctors/prescriptions/my-prescriptions'); // For patients viewing their own
export const getPrescriptionsByPatientId = (patientId) => 
  axiosClient.get(`/doctors/prescriptions/patient/${patientId}`);

// --- Patient Reports ---
export const viewPatientReports = (patientId) => 
  axiosClient.get(`/doctors/patient/${patientId}/reports`);

// --- Telemedicine ---
export const startTelemedicineSession = (appointmentId) => 
  axiosClient.post('/doctors/telemedicine/start', { appointmentId });
export const getDoctorSessions = (status = '') => {
  const url = `/telemedicine${status ? `?status=${status}` : ''}`;
  return axiosClient.get(url); // Note: Ensure gateway routes /api/telemedicine to port 5004
};
export const startSession = (sessionId) => 
  axiosClient.put(`/telemedicine/start/${sessionId}`);
export const endSession = (sessionId) => 
  axiosClient.put(`/telemedicine/end/${sessionId}`);

// --- Public/Admin ---
export const getAllDoctors = (specialty = '') => 
  axiosClient.get(`/doctors/all${specialty ? `?specialty=${specialty}` : ''}`);
export const getAllDoctorsAdmin = () => axiosClient.get('/doctors/admin/all');
export const verifyDoctor = (id) => axiosClient.put(`/doctors/admin/${id}/verify`);
export const getDoctorById = (id) => axiosClient.get(`/doctors/${id}`);