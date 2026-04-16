import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Loader2 } from "lucide-react";
import API from "../../api/axiosClient";

const MeetingRoom = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(true);

  const { sessionTitle, userName, role } = location.state || {
    sessionTitle: "Consultation",
    userName: "User",
    role: "Patient",
  };

  const isStaff = role.toLowerCase() === "admin" || role.toLowerCase() === "doctor";

  useEffect(() => {
    const verify = async () => {
      try {
        await API.get(`/telemedicine/${sessionId}`);
      } catch (err) {
        console.error("Session verification failed", err);
      } finally {
        setInitialLoading(false);
      }
    };
    verify();
  }, [sessionId]);

  const handleMeetingJoined = async () => {
    if (isStaff) {
      try {
        await API.put(`/telemedicine/start/${sessionId}`);
      } catch (err) {
        console.error("Auto-start failed", err);
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-accent mb-4" size={48} />
        <p className="font-medium text-primary">Verifying secure connection...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="bg-primary px-6 py-3 text-white flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-success h-3 w-3 rounded-full animate-pulse"></div>
          <h1 className="font-semibold">{sessionTitle}</h1>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase tracking-widest">{role} Mode</span>
        </div>
        <button onClick={() => navigate(-1)} className="bg-danger hover:bg-red-600 px-4 py-1 rounded-lg text-sm font-bold transition-colors">
          Leave Call
        </button>
      </div>
      <div className="flex-1 relative">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={`MedApp-Session-${sessionId}`}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: false,
            startScreenSharing: true,
            prejoinPageEnabled: false,
          }}
          userInfo={{ displayName: userName }}
          onApiReady={() => handleMeetingJoined()}
          getIFrameRef={(iframeRef) => { iframeRef.style.height = "100%"; }}
        />
      </div>
    </div>
  );
};

export default MeetingRoom;