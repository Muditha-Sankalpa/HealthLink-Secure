import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, ExternalLink, Loader2, AlertCircle, Play, Square, RefreshCw } from 'lucide-react';
import { DoctorNavBar } from '../../components/shared';
import { getDoctorSessions, startSession, endSession } from '../../api/doctorApi';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
    ACTIVE: "bg-purple-100 text-purple-700 border-purple-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

const DoctorTelemedicine = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await getDoctorSessions();
      const data = Array.isArray(response.data) ? response.data : response.data.sessions || [];
      setSessions(data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to telemedicine service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = filter === 'all' ? sessions : sessions.filter(s => s.status === filter.toUpperCase());

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleStartSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      await startSession(sessionId);
      await fetchSessions();
    } catch (err) {
      alert("Failed to start session: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!window.confirm("End this consultation session?")) return;
    try {
      setActionLoading(sessionId);
      await endSession(sessionId);
      await fetchSessions();
    } catch (err) {
      alert("Failed to end session: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) window.open(meetingLink, '_blank', 'noopener,noreferrer');
  };

  const stats = {
    total: sessions.length,
    scheduled: sessions.filter(s => s.status === 'SCHEDULED').length,
    active: sessions.filter(s => s.status === 'ACTIVE').length,
    completed: sessions.filter(s => s.status === 'COMPLETED').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#122056] italic">My Telemedicine Sessions</h1>
            <p className="text-gray-500">Manage your virtual consultations</p>
          </div>
          <button onClick={fetchSessions} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-[#122056]">{stats.total}</p></div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Scheduled</p><p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p></div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold text-purple-600">{stats.active}</p></div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{stats.completed}</p></div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[{ key: 'all', label: 'All' }, { key: 'SCHEDULED', label: 'Scheduled' }, { key: 'ACTIVE', label: 'Active' }, { key: 'COMPLETED', label: 'Completed' }].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${filter === f.key ? 'bg-[#122056] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {f.label} ({f.key === 'all' ? stats.total : stats[f.key.toLowerCase()] || 0})
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500"><Loader2 className="animate-spin mb-3" size={32} /><p>Loading your sessions...</p></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50"><AlertCircle size={32} className="mb-3" /><p className="font-medium">{error}</p><button onClick={fetchSessions} className="mt-4 px-4 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition">Try Again</button></div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-20 text-center text-gray-500"><Video size={48} className="mx-auto mb-4 opacity-50" /><p className="text-lg font-medium">No sessions found</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSessions.map((session) => (
                <div key={session._id || session.sessionId} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[#122056] truncate">{session.sessionTitle || 'Telemedicine Consultation'}</h3>
                        <StatusBadge status={session.status} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /><span>{formatDate(session.scheduledTime)}</span></div>
                        <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{session.sessionId?.slice(0, 8)}...</span></div>
                        <div className="flex items-center gap-2 md:col-span-2"><span className="text-gray-400">Patient:</span><span className="font-medium">{session.patientId?.slice(0, 12)}...</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {session.meetingLink && <button onClick={() => handleJoinMeeting(session.meetingLink)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#122056] text-white text-sm font-semibold hover:opacity-90 transition"><ExternalLink size={16} /> Join</button>}
                      {session.status === 'SCHEDULED' && <button onClick={() => handleStartSession(session.sessionId || session._id)} disabled={actionLoading === (session.sessionId || session._id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50">{actionLoading === (session.sessionId || session._id) ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />} Start</button>}
                      {session.status === 'ACTIVE' && <button onClick={() => handleEndSession(session.sessionId || session._id)} disabled={actionLoading === (session.sessionId || session._id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">{actionLoading === (session.sessionId || session._id) ? <Loader2 className="animate-spin" size={16} /> : <Square size={16} />} End</button>}
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

export default DoctorTelemedicine;