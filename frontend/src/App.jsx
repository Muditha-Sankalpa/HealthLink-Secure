import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PatientProfile from './pages/patient/PatientProfile';
import UpdateProfile from './pages/patient/UpdateProfile';
import MedicalHistory from './pages/patient/MedicalHistory';
import UploadReport from './pages/patient/UploadReport';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from "./pages/auth/AuthPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/update" element={<UpdateProfile />} />
        <Route path="/patient/history" element={<MedicalHistory />} />
        <Route path="/patient/upload-report" element={<UploadReport />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;