import React, { useState, useEffect } from "react";
import API from "../../api/axiosClient";
import {
  Video,
  Calendar,
  User,
  Stethoscope,
  ExternalLink,
  Search,
  MoreVertical,
  AlertCircle,
  CreditCard,
  Hash,
  Loader2,
} from "lucide-react";
import StatusBadge from "../../components/telemedicine/StatusBadge";
import CreateSessionModal from "../../components/telemedicine/CreateSessionModal";
import { AdminNavBar } from "../../components/shared";
import { PatientNavBar } from "../../components/shared";
import VirtualConsultationList from "../../components/telemedicine/VirtualDoctorsModal";
import { useNavigate } from "react-router-dom";

const SessionsPageAdmin = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role; 
  const isAdmin = userRole === "Admin";
  const isPatient = userRole === "Patient";

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [preSelectedDocId, setPreSelectedDocId] = useState("");

  // LOGIC: Find if there is a session live for this specific patient
  const activeSessionForPatient = sessions.find(
  (s) =>
    isPatient &&
    s.status === "ACTIVE" &&
    String(s.patientId?._id) === String(user.id || user._id)
);

const fetchSessions = async (isSilent = false) => {
  try {
    if (!isSilent) setLoading(true);
    const response = await API.get("/telemedicine");
    const data = Array.isArray(response.data) ? response.data : (response.data.sessions || []);

    const enriched = await Promise.all(
      data.map(async (session) => {
        // DOCTOR NAME: Priority logic
        let doctorName = session.doctorName || session.doctorId?.name;
        const docId = session.doctorId?._id || session.doctorId;

        // PATIENT NAME: Priority logic
        let patientName = session.patientName || session.patientId?.name;
        const patId = session.patientId?._id || session.patientId;

        // IF ADMIN: Just use the ID if the name isn't already there (prevents 404s)
        if (isAdmin && !patientName) {
           patientName = patId ? `ID: ${String(patId).substring(String(patId).length - 6)}` : "No ID";
        }

        // IF PATIENT: Only fetch if it's not the current user
        if (!isAdmin && !patientName && patId) {
          if (String(patId) === String(user.id || user._id)) {
            patientName = user.name;
          }
        }

        return {
          ...session,
          doctorDisplayName: doctorName || (docId ? `Doc-${String(docId).slice(-4)}` : "Unknown"),
          patientDisplayName: patientName || "Unknown Patient",
        };
      })
    );

    setSessions(enriched);
    setError(null);
  } catch (err) {
    console.error("Fetch Error:", err);
    setError("Failed to load");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSessions();
    
    // Poll every 5 seconds for patients so they see the "Live" banner immediately
    let interval;
    if (isPatient) {
      interval = setInterval(() => fetchSessions(true), 5000);
    }
    return () => clearInterval(interval);
  }, [isPatient]);

  const handleJoinMeeting = (session) => {
    navigate(`/admin/telemedicine/join/${session.sessionId}`, {
      state: {
        sessionTitle: session.sessionTitle,
        userName: user.name || "User",
        role: userRole,
      },
    });
  };

 const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await API.delete(`/telemedicine/${sessionId}`);
      fetchSessions(true);
    } catch (err) {
      alert("Failed to delete session");
    }
  };

  const handleStart = async (sessionId) => {
    try {
      await API.put(`/telemedicine/start/${sessionId}`);
      fetchSessions(true);
    } catch (err) {
      alert("Failed to start session");
    }
  };

  const handleComplete = async (sessionId) => {
    try {
      await API.put(`/telemedicine/end/${sessionId}`);
      fetchSessions(true);
    } catch (err) {
      alert("Failed to complete session");
    }
  };



  const handleCancelSession = async (session) => {
  const confirmMsg = isAdmin 
    ? "Are you sure you want to delete this session?" 
    : "Are you sure you want to cancel your appointment?";
    
  if (!window.confirm(confirmMsg)) return;

  try {
    // We use the same DELETE endpoint, or a PUT to update status to 'CANCELLED'
    await API.delete(`/telemedicine/${session.sessionId}`);
    alert("Session cancelled successfully");
    fetchSessions(true);
  } catch (err) {
    alert("Failed to cancel session");
  }
};

  const handleBookDoctor = (doctorObject) => {
  setSelectedDoctor(doctorObject);
  setIsModalOpen(true);
};

  

  const filteredSessions = sessions.filter(
  (session) =>
    session.sessionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.sessionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };
console.log("Sessions:", sessions.map(s => ({ title: s.sessionTitle, status: s.status })));
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      {isAdmin && <AdminNavBar />}
      {isPatient && <PatientNavBar/>}

      <div style={{ flex: 1, overflowY: "auto" }}>
        
        {/* LIVE BANNER FOR PATIENTS */}
        {activeSessionForPatient && (
          <div className="bg-accent text-white px-6 py-4 flex items-center justify-between shadow-xl sticky top-0 z-50 animate-pulse">
            <div className="flex items-center gap-3">
              <Video size={24} className="text-white" />
              <div>
                <p className="font-bold">Your session is now live!</p>
                <p className="text-xs opacity-90">Doctor is waiting in: {activeSessionForPatient.sessionTitle}</p>
              </div>
            </div>
            <button
              onClick={() => handleJoinMeeting(activeSessionForPatient)}
              className="bg-white text-accent px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              Join Now <ExternalLink size={16} />
            </button>
          </div>
        )}

        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary italic font-serif">
                {isAdmin ? "Telemedicine Administration" : "My Consultations"}
              </h1>
              <p className="text-text-secondary">
                {isAdmin ? "Manage virtual consultations" : "View your upcoming medical sessions"}
              </p>
            </div>
            
              <div className="flex flex-wrap items-center gap-3">
  {/* The New Component Button */}
  <VirtualConsultationList onBook={handleBookDoctor} />

  {/* Existing New Session Button */}
  {/* <button
    onClick={() => setIsModalOpen(true)}
    className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md border border-primary"
  >
    <Calendar size={18} />
    <span>New Session</span>
  </button> */}
</div>
            
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary border-l-4 border-l-primary">
              <p className="text-text-secondary text-sm font-medium">Total Sessions</p>
              <p className="text-3xl font-bold text-primary mt-1">{sessions.length}</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary border-l-4 border-l-success">
              <p className="text-text-secondary text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-success mt-1">{sessions.filter(s => s.status === "COMPLETED").length}</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary border-l-4 border-l-accent">
              <p className="text-text-secondary text-sm font-medium">Active/Scheduled</p>
              <p className="text-3xl font-bold text-accent mt-1">{sessions.filter(s => s.status !== "COMPLETED" && s.status !== "CANCELLED").length}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface rounded-xl border border-secondary overflow-hidden shadow-sm">
            <div className="p-4 border-b border-secondary flex justify-between items-center bg-white">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  className="w-full pl-10 pr-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => fetchSessions(false)} className="text-accent text-sm font-medium hover:underline">Refresh</button>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center text-text-secondary"><Loader2 className="animate-spin mb-2" /> Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/30 border-b border-secondary">
                      <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Session</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Participants</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
  {filteredSessions.map((session) => (
    <tr key={session._id} className="hover:bg-background transition-colors">
      
      {/* 1. CLEANER SESSION INFO */}
      <td className="px-6 py-4">
        <div className="font-bold text-primary">{session.sessionTitle}</div>
        <div className="flex items-center gap-1 text-[10px] text-accent font-bold uppercase tracking-tighter">
          <Hash size={10} /> {session.sessionId}
        </div>
      </td>

      {/* 2. HUMAN-READABLE PARTICIPANTS */}
      {/* Inside the Table Body */}
<td className="px-6 py-4">
  <div className="flex flex-col gap-1">
    {/* Doctor Display */}
    <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
        <Stethoscope size={12} className="text-accent"/>
      </div>
      <span>{session.doctorDisplayName}</span>
    </div>

    {/* Patient Display */}
    <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
        <User size={12} className="text-primary"/>
      </div>
      <span>{session.patientDisplayName}</span>
    </div>
  </div>
</td>

      <td className="px-6 py-4 text-sm text-text-primary font-medium">
        {formatDate(session.scheduledTime)}
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={session.status} />
      </td>

      {/* 3. UPDATED ACTIONS */}
      <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <div className="relative group">
  <button
    onClick={() => (isAdmin || session.status === "ACTIVE") ? handleJoinMeeting(session) : null}
    disabled={!isAdmin && session.status !== "ACTIVE"}
    className={`p-2 border border-secondary rounded-lg transition-all ${
      isAdmin || session.status === "ACTIVE"
        ? "text-accent hover:bg-accent hover:text-white cursor-pointer"
        : "text-gray-300 cursor-not-allowed border-gray-200"
    }`}
  >
    <ExternalLink size={18} />
  </button>
  {!isAdmin && session.status !== "ACTIVE" && (
    <div className="absolute bottom-full mb-2 right-0 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
      Session hasn't started yet
    </div>
  )}
</div>
                            {isAdmin && (
                              <>
                                <button onClick={() => handleJoinMeeting(session)} className="p-2 border border-secondary rounded-lg text-success hover:bg-success hover:text-white transition-all"><Video size={18} /></button>
                                <div className="relative">
                                  <button onClick={() => setOpenMenuId(openMenuId === session.sessionId ? null : session.sessionId)} className="p-2 text-gray-400"><MoreVertical size={18} /></button>
                                  {openMenuId === session.sessionId && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-secondary rounded-lg shadow-xl z-20">
                                      <button onClick={() => { handleStart(session.sessionId); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Start Session</button>
                                      <button onClick={() => { handleComplete(session.sessionId); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Complete Session</button>
                                      <button onClick={() => { handleDelete(session.sessionId); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 text-sm">Cancel Session</button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreateSessionModal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
  onRefresh={() => fetchSessions(true)}
  doctorData={selectedDoctor} // The full object from the list
/>
    </div>
  );
};

export default SessionsPageAdmin;