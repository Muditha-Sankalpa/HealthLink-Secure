import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientNavBar } from '../../components/shared';
import { getProfile } from '../../api/patientApi';

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then((res) => setPatient(res.data)).catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientNavBar requireAuth={false} />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-[#122056] flex items-center justify-center text-white text-3xl font-bold mb-2">
              {patient?.name?.charAt(0) || '?'}
            </div>
            <h2 className="text-xl font-bold text-[#122056]">{patient?.name}</h2>
            <span className="text-sm text-gray-500">Patient</span>
          </div>

          {/* Reminders */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              📅 <strong>Appointment Reminder</strong>
              <p className="mt-1 text-xs text-blue-600">Check your upcoming appointments</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-800">
              💻 <strong>Telemedicine Session</strong>
              <p className="mt-1 text-xs text-purple-600">Join your scheduled sessions</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/patient/history')}
              className="w-full py-3 rounded-xl bg-[#122056] text-white font-semibold hover:opacity-90 transition"
            >
              Get Medical History
            </button>
            <button
              onClick={() => navigate('/patient/upload-report')}
              className="w-full py-3 rounded-xl border-2 border-[#122056] text-[#122056] font-semibold hover:bg-[#122056] hover:text-white transition"
            >
              Upload a Report
            </button>
            <button
              onClick={() => navigate('/patient/update')}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition"
            >
              Update Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;