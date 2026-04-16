// src/components/telemedicine/CreateSessionModal.jsx
import React, { useState } from 'react';
import { X, Video, Hash, Calendar, Loader2 } from 'lucide-react';
import API from '../../api/axiosClient';

const CreateSessionModal = ({ isOpen, onClose, onRefresh }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    appointmentId: '',
    doctorId: '',
    patientId: '',
    scheduledTime: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await API.post('/api/telemedicine/create', formData);
      onRefresh(); // Refresh the list in the parent
      onClose();   // Close the modal
      setFormData({ appointmentId: '', doctorId: '', patientId: '', scheduledTime: '' });
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Check connection"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-secondary overflow-hidden animate-in zoom-in duration-200">
        <div className="bg-primary p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Video size={20} className="text-accent" />
            <h2 className="text-lg font-bold italic font-serif tracking-wide">New Virtual Session</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-primary uppercase mb-1 block ml-1">Appointment ID</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" size={16} />
                <input required name="appointmentId" placeholder="APT-000" className="w-full pl-10 pr-4 py-2.5 bg-background border border-secondary rounded-xl outline-none focus:ring-2 focus:ring-accent/20" 
                  value={formData.appointmentId} onChange={(e) => setFormData({...formData, appointmentId: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-primary uppercase mb-1 block ml-1">Schedule At</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" size={16} />
                <input required type="datetime-local" name="scheduledTime" className="w-full pl-10 pr-4 py-2.5 bg-background border border-secondary rounded-xl outline-none focus:ring-2 focus:ring-accent/20" 
                  value={formData.scheduledTime} onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-primary uppercase mb-1 block ml-1">Doctor ID</label>
              <input required name="doctorId" placeholder="Doctor MongoDB ID" className="w-full px-4 py-2.5 bg-background border border-secondary rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-accent/20" 
                value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-primary uppercase mb-1 block ml-1">Patient ID</label>
              <input required name="patientId" placeholder="Patient MongoDB ID" className="w-full px-4 py-2.5 bg-background border border-secondary rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-accent/20" 
                value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-text-primary hover:bg-secondary rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={isCreating} className="flex-[2] bg-accent text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2">
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;