import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from "./pages/auth/AuthPage";
import PatientDashboard from './pages/patient/PatientDashboard';
import SessionsPage from './pages/telemedicine/SessionsPageAdmin';
import BookAppointment from './components/appointments/BookAppointment';
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
        <Route path="/" element={<Home />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/allSessions" element={<SessionsPage />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/admin/telemedicine/join/:sessionId" element={<MeetingRoom />} />
        <Route path="/patient/symptom-checker" element={<SymptomChecker />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/payment" element={<PaymentComponent />} />
        <Route path="/allPayments" element={<PaymentsAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
