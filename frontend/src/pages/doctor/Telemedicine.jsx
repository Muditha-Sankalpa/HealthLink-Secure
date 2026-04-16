import React, { useState, useEffect } from 'react';
import { DoctorNavBar } from '../../components/shared';
import { getDoctorSessions, startSession, endSession } from '../../api/doctorApi';
import { Video, Calendar, Clock, ExternalLink, Loader2, AlertCircle, Play, Square, RefreshCw, Users } from 'lucide-react';

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
      setError(null);
      
      // Call the API - Backend will auto-filter by doctorId from JWT token
      const response = await getDoctorSessions();
      
      // Handle response format
      const data = Array.isArray(response.data) 
        ? response.data 
        : response.data.sessions || [];
      
      setSessions(data);
    } catch (err) {
      console.error("Fetch error:", err);
      
      // Better error messages
      if (err.code === 'ECONNREFUSED') {
        setError("Telemedicine service is not running. Please start the backend server.");
      } else if (err.response?.status === 401) {
        setError("Unauthorized. Please login again.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (err.response?.status === 404) {
        setError("Telemedicine route not found. Check API Gateway configuration.");
      } else {
        setError("Unable to connect to telemedicine service.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filter sessions by status
  const filteredSessions = filter === 'all' 
    ? sessions 
    : sessions.filter(s => s.status?.toUpperCase() === filter.toUpperCase());

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleStartSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      await startSession(sessionId);
      await fetchSessions(); // Refresh list
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
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Stats calculations
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
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#122056] italic">My Telemedicine Sessions</h1>
            <p className="text-gray-500 mt-1">Manage your virtual consultations</p>
          </div>
          <button 
            onClick={fetchSessions}
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total</p>
              <Video size={20} className="text-[#122056]" />
            </div>
            <p className="text-3xl font-bold text-[#122056]">{stats.total}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Scheduled</p>
              <Calendar size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Active</p>
              <Users size={20} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.active}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Completed</p>
              <Clock size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'SCHEDULED', label: 'Scheduled', count: stats.scheduled },
            { key: 'ACTIVE', label: 'Active', count: stats.active },
            { key: 'COMPLETED', label: 'Completed', count: stats.completed },
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
              <p className="text-lg font-medium">Loading your sessions...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50">
              <AlertCircle size={40} className="mb-3" />
              <p className="text-lg font-medium mb-4">{error}</p>
              <button 
                onClick={fetchSessions}
                className="px-6 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <Video size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No sessions found</p>
              <p className="text-sm">
                {filter === 'all' 
                  ? "Accept an appointment to create a telemedicine session." 
                  : `No ${filter.toLowerCase()} sessions at the moment.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSessions.map((session) => (
                <div key={session._id || session.sessionId} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Session Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg text-[#122056] truncate">
                          {session.sessionTitle || 'Telemedicine Consultation'}
                        </h3>
                        <StatusBadge status={session.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <div>
                            <span className="text-gray-400 block text-xs">Scheduled</span>
                            <span className="font-medium">{formatDate(session.scheduledTime)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <div>
                            <span className="text-gray-400 block text-xs">Session ID</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {session.sessionId?.slice(0, 12)}...
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-gray-400" />
                          <div>
                            <span className="text-gray-400 block text-xs">Patient</span>
                            <span className="font-medium">{session.patientId?.slice(0, 12)}...</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      {/* Join Meeting - Always visible if link exists */}
                      {session.meetingLink && (
                        <button
                          onClick={() => handleJoinMeeting(session.meetingLink)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#122056] text-white text-sm font-semibold hover:opacity-90 transition"
                        >
                          <ExternalLink size={16} />
                          Join
                        </button>
                      )}

                      {/* Start Session - Only for SCHEDULED */}
                      {session.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleStartSession(session.sessionId || session._id)}
                          disabled={actionLoading === (session.sessionId || session._id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50"
                        >
                          {actionLoading === (session.sessionId || session._id) ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                          Start
                        </button>
                      )}

                      {/* End Session - Only for ACTIVE */}
                      {session.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleEndSession(session.sessionId || session._id)}
                          disabled={actionLoading === (session.sessionId || session._id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {actionLoading === (session.sessionId || session._id) ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                          End
                        </button>
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

export default DoctorTelemedicine;