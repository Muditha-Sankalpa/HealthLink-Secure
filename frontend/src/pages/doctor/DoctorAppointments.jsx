import { useEffect, useState } from 'react';
import { DoctorNavBar } from '../../components/shared';
import { getAppointments, updateAppointmentStatus, acceptConsultation } from '../../api/doctorApi';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    getAppointments().then((res) => setAppointments(res.data)).catch(console.error);
  };

  const handleStatusUpdate = async (id, status) => {
    await updateAppointmentStatus(id, status);
    fetchAppointments();
  };

  const handleConsultation = async (id, accept) => {
    await acceptConsultation(id, accept);
    fetchAppointments();
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status.toLowerCase() === filter.toLowerCase());

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      rejected: 'bg-gray-100 text-gray-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[#122056] mb-6">Appointments</h1>
          
          <div className="flex gap-3 mb-6">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
                  filter === f ? 'bg-[#122056] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">No appointments found</div>
            ) : (
              filteredAppointments.map((apt) => (
                <div key={apt._id} className="bg-white rounded-2xl shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-[#122056]">Patient: {apt.patientName || 'Unknown'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <p><strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {apt.time}</p>
                        <p><strong>Type:</strong> {apt.type || 'In-Person'}</p>
                        <p><strong>Reason:</strong> {apt.reason || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {apt.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(apt._id, 'Confirmed')} className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition">Accept</button>
                          <button onClick={() => handleStatusUpdate(apt._id, 'Rejected')} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">Reject</button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button onClick={() => handleConsultation(apt._id, true)} className="px-4 py-2 rounded-lg bg-[#122056] text-white text-sm font-semibold hover:opacity-90 transition">Start Telemedicine</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorAppointments;