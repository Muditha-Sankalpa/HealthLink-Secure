import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import API from '../../api/axiosClient'
import { 
  Video, 
  Calendar, 
  User, 
  Stethoscope, 
  ExternalLink, 
  Search, 
  Filter,
  MoreVertical,
  AlertCircle,
  Loader2
} from 'lucide-react';
import StatusBadge from '../../components/telemedicine/StatusBadge';
import CreateSessionModal from '../../components/telemedicine/CreateSessionModal'
import { useNavigate } from 'react-router-dom';

const SessionsPageAdmin = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = 'http://localhost:5004/api/telemedicine';

const fetchSessions = async () => {
  try {
    setLoading(true);
    
    // We add '/api' so the Gateway (port 5000) can route it to port 5004
    const response = await API.get('/telemedicine'); 
    
    // In many MERN setups, the actual data is in response.data
    // but check if your backend wraps it in another object (like response.data.sessions)
    const data = Array.isArray(response.data) ? response.data : response.data.sessions;
    
    setSessions(data || []);
    setError(null);
  } catch (err) {
    console.error("Fetch error details:", err.response);
    
    if (err.response?.status === 401) {
      setError("Unauthorized: Please Login to access Admin panel.");
    } else if (err.response?.status === 404) {
      setError("Route not found. Ensure the Gateway and Telemedicine service are both running.");
    } else {
      setError("Server Error: Unable to connect to the API Gateway.");
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filter sessions based on Search Term
  const filteredSessions = sessions.filter(session => 
    session.sessionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.sessionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary italic font-serif">Telemedicine Sessions</h1>
          <p className="text-text-secondary">Manage and monitor all virtual consultations</p>
        </div>
        <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-accent hover:brightness-110 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md">
          <Video size={18} />
          <span>New Session</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary border-l-4 border-l-primary">
          <p className="text-text-secondary text-sm font-medium">Total Sessions</p>
          <p className="text-3xl font-bold text-primary mt-1">{sessions.length}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary border-l-4 border-l-success">
          <p className="text-text-secondary text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-success mt-1">
            {sessions.filter(s => s.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary border-l-4 border-l-accent">
          <p className="text-text-secondary text-sm font-medium">Active/Scheduled</p>
          <p className="text-3xl font-bold text-accent mt-1">
            {sessions.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length}
          </p>
        </div>
      </div>

      

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-t-xl border-x border-t border-secondary flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Session ID, Patient or Title..." 
            className="w-full pl-10 pr-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <button 
            onClick={fetchSessions}
            className="text-text-secondary text-sm hover:underline mr-4"
           >
             Refresh Data
           </button>
           <button className="flex items-center gap-2 text-text-primary px-4 py-2 border border-secondary rounded-lg hover:bg-secondary transition-colors">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Data Table / Error State / Loading State */}
      <div className="bg-surface rounded-b-xl border border-secondary overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p>Fetching sessions from server...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-danger bg-danger/5">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-medium">{error}</p>
            <button 
              onClick={fetchSessions}
              className="mt-4 px-4 py-2 bg-white border border-danger rounded-lg hover:bg-danger hover:text-white transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/50 border-b border-secondary">
                  <th className="px-6 py-4 text-sm font-semibold text-primary uppercase tracking-wider">Session Info</th>
                  <th className="px-6 py-4 text-sm font-semibold text-primary uppercase tracking-wider">Participants</th>
                  <th className="px-6 py-4 text-sm font-semibold text-primary uppercase tracking-wider">Scheduled Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-primary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-primary text-right uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {filteredSessions.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-text-secondary italic">
                            No sessions found matching your criteria.
                        </td>
                    </tr>
                ) : filteredSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-background transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary">{session.sessionTitle}</div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase font-mono bg-secondary w-fit px-1 rounded">
                        {session.sessionId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-text-primary">
                          <Stethoscope size={14} className="text-accent" />
                          <span className="font-medium">{session.doctorId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-primary">
                          <User size={14} className="text-text-secondary" />
                          <span>{session.patientId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-text-primary">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(session.scheduledTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={session.meetingLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-accent hover:bg-accent hover:text-white rounded-lg transition-all shadow-sm border border-secondary"
                          title="Join Meeting"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button className="p-2 text-gray-400 hover:text-primary rounded-lg border border-transparent hover:border-secondary transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateSessionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchSessions} 
      />
    </div>
  );
};

export default SessionsPageAdmin;