import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PatientProfile from './pages/patient/PatientProfile';
import UpdateProfile from './pages/patient/UpdateProfile';
import MedicalHistory from './pages/patient/MedicalHistory';
import UploadReport from './pages/patient/UploadReport';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from "./pages/auth/AuthPage";
import SessionsPage from './pages/telemedicine/SessionsPageAdmin';
// Doctor Imports
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import Prescriptions from './pages/doctor/Prescriptions';
import Availability from './pages/doctor/Availability';
import DoctorTelemedicine from './pages/doctor/Telemedicine';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/update" element={<UpdateProfile />} />
        <Route path="/patient/history" element={<MedicalHistory />} />
        <Route path="/patient/upload-report" element={<UploadReport />} />
         {/* Doctor Routes */}
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/prescriptions" element={<Prescriptions />} />
        <Route path="/doctor/availability" element={<Availability />} />
        <Route path="/doctor/telemedicine" element={<DoctorTelemedicine />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/allSessions" element={<SessionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
