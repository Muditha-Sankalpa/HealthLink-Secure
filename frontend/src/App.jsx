import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from './pages/auth/AuthPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import SessionsPage from './pages/telemedicine/SessionsPageAdmin';
import BookAppointment from './components/appointments/BookAppointment';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import Prescriptions from './pages/doctor/Prescriptions';
import Availability from './pages/doctor/Availability';
import DoctorTelemedicine from './pages/doctor/Telemedicine';
import PatientAppointments from './pages/patient/Patientappointments';
import MeetingRoom from './pages/telemedicine/MeetingRoom';
import SymptomChecker from './pages/patient/SymptomChecker';
import AdminAppointments from './pages/admin/AdminAppointments';
import PaymentComponent from './components/payments/PaymentForm';
import PaymentsAdmin from './pages/payment/PaymentsAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Patient-only routes */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['Patient']}><PatientDashboard /></ProtectedRoute>
        } />
        <Route path="/patient/appointments" element={
          <ProtectedRoute allowedRoles={['Patient']}><PatientAppointments /></ProtectedRoute>
        } />
        <Route path="/patient/symptom-checker" element={
          <ProtectedRoute allowedRoles={['Patient']}><SymptomChecker /></ProtectedRoute>
        } />
        <Route path="/book-appointment" element={
          <ProtectedRoute allowedRoles={['Patient']}><BookAppointment /></ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute allowedRoles={['Patient']}><PaymentComponent /></ProtectedRoute>
        } />

        {/* Doctor-only routes */}
        <Route path="/doctor/profile" element={
          <ProtectedRoute allowedRoles={['Doctor']}><DoctorProfile /></ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute allowedRoles={['Doctor']}><DoctorAppointments /></ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions" element={
          <ProtectedRoute allowedRoles={['Doctor']}><Prescriptions /></ProtectedRoute>
        } />
        <Route path="/doctor/availability" element={
          <ProtectedRoute allowedRoles={['Doctor']}><Availability /></ProtectedRoute>
        } />
        <Route path="/doctor/telemedicine" element={
          <ProtectedRoute allowedRoles={['Doctor']}><DoctorTelemedicine /></ProtectedRoute>
        } />

        {/* Admin-only routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute allowedRoles={['Admin']}><AdminAppointments /></ProtectedRoute>
        } />
        <Route path="/allSessions" element={
          <ProtectedRoute allowedRoles={['Admin']}><SessionsPage /></ProtectedRoute>
        } />
        <Route path="/allPayments" element={
          <ProtectedRoute allowedRoles={['Admin']}><PaymentsAdmin /></ProtectedRoute>
        } />

        {/* Shared across authenticated roles */}
        <Route path="/admin/telemedicine/join/:sessionId" element={
          <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Patient']}><MeetingRoom /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;