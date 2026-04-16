import { useEffect, useState } from 'react';
import { DoctorNavBar } from '../../components/shared';
import { getAppointments, updateAppointmentStatus, acceptConsultation } from '../../api/doctorApi';
import { Calendar, Clock, User, Video, Check, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    Scheduled: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Confirmed: "bg-green-100 text-green-700 border-green-200",
    Completed: "bg-blue-100 text-blue-700 border-blue-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
    Rejected: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAppointments();
      const data = Array.isArray(response.data) ? response.data : [];
      setAppointments(data);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.code === 'ECONNREFUSED') {
        setError("Backend services not running. Start Doctor & Appointment services.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError("Unable to load appointments.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status?.toLowerCase() === filter.toLowerCase());

  const handleStatusUpdate = async (id, status) => {
    try {
      setActionLoading(id);
      await updateAppointmentStatus(id, status);
      await fetchAppointments();
    } catch (err) {
      alert(`Failed to ${status.toLowerCase()} appointment: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConsultation = async (id, accept) => {
    try {
      setActionLoading(id);
      const res = await acceptConsultation(id, accept);
      if (accept && res.data.session?.meetingLink) {
        window.open(res.data.session.meetingLink, '_blank');
      }
      await fetchAppointments();
    } catch (err) {
      alert(`Failed to ${accept ? 'accept' : 'reject'} consultation: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Scheduled').length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#122056] italic">My Appointments</h1>
            <p className="text-gray-500 mt-1">Manage your scheduled consultations</p>
          </div>
          <button 
            onClick={fetchAppointments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-bold text-[#122056]">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'Scheduled', label: 'Pending', count: stats.pending },
            { key: 'Confirmed', label: 'Confirmed', count: stats.confirmed },
            { key: 'Completed', label: 'Completed', count: stats.completed },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                filter === f.key 
                  ? 'bg-[#122056] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="animate-spin mb-3 text-[#122056]" size={40} />
              <p className="text-lg font-medium">Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50">
              <AlertCircle size={40} className="mb-3" />
              <p className="text-lg font-medium mb-4">{error}</p>
              <button onClick={fetchAppointments} className="px-6 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition font-semibold">
                Try Again
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <Calendar size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No appointments found</p>
              <p className="text-sm">{filter === 'all' ? "Your schedule is currently empty." : `No ${filter.toLowerCase()} appointments.`}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAppointments.map((apt) => (
                <div key={apt._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg text-[#122056] truncate">
                          Patient: {apt.patientName || 'Unknown'}
                        </h3>
                        <StatusBadge status={apt.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <div>
                            <span className="text-gray-400 block text-xs">Date</span>
                            <span className="font-medium">{formatDate(apt.date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <div>
                            <span className="text-gray-400 block text-xs">Time</span>
                            <span className="font-medium">{apt.startTime || apt.time || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <div>
                            <span className="text-gray-400 block text-xs">Type</span>
                            <span className="font-medium">{apt.appointmentType || 'In-Person'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">Queue</span>
                          <span className="font-medium">#{apt.queueNumber || 'N/A'}</span>
                        </div>
                      </div>
                      
                      {apt.notes && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {apt.notes}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      {apt.status === 'Scheduled' ? (
                        <>
                          <button
                            onClick={() => handleConsultation(apt._id, true)}
                            disabled={actionLoading === apt._id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50"
                          >
                            {actionLoading === apt._id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'Rejected')}
                            disabled={actionLoading === apt._id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                          >
                            {actionLoading === apt._id ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                            Reject
                          </button>
                        </>
                      ) : apt.status === 'Confirmed' ? (
                        <>
                          <button
                            onClick={() => handleConsultation(apt._id, true)}
                            disabled={actionLoading === apt._id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#122056] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
                          >
                            {actionLoading === apt._id ? <Loader2 className="animate-spin" size={16} /> : <Video size={16} />}
                            Start Telemedicine
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'Completed')}
                            disabled={actionLoading === apt._id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                          >
                            {actionLoading === apt._id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            Complete
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm italic">
                          {apt.status === 'Completed' ? 'Appointment finished' : 'Appointment cancelled'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorAppointments;