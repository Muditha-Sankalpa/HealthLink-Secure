import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from "./pages/auth/AuthPage";
import PatientDashboard from './pages/patient/PatientDashboard';
import SessionsPage from './pages/telemedicine/SessionsPageAdmin';
import BookAppointment from './components/appointments/BookAppointment';
// Doctor Imports
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import Prescriptions from './pages/doctor/Prescriptions';
import Availability from './pages/doctor/Availability';
import DoctorTelemedicine from './pages/doctor/Telemedicine';
import PatientAppointments from './pages/patient/Patientappointments';
import MeetingRoom from './pages/telemedicine/MeetingRoom';
import SymptomChecker from './pages/patient/SymptomChecker';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient" element={<PatientDashboard />} />
       
        {/* Doctor Routes */}
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/prescriptions" element={<Prescriptions />} />
        <Route path="/doctor/availability" element={<Availability />} />
        <Route path="/doctor/telemedicine" element={<DoctorTelemedicine />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/allSessions" element={<SessionsPage />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/admin/telemedicine/join/:sessionId" element={<MeetingRoom />} />
        <Route path="/patient/symptom-checker" element={<SymptomChecker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
