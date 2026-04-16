import React, { useState } from 'react';
// Import your custom axios client (adjust the path to where your file is located)
import axiosClient from '../../api/axiosClient'; 
import { X, Video, ShieldCheck, Phone, DollarSign, User } from 'lucide-react';

const VirtualConsultationList = ({ onBook }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);

    try {
      // Using your axiosClient - the base URL and Token are handled automatically
      // We just need the relative path
      const response = await axiosClient.get('/doctors/all');
      
      // Filter for virtual-only doctors
      const virtualDocs = response.data.filter(doc => doc.isVirtualConsultationAvailable === true);
      setDoctors(virtualDocs);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Could not load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button - Styled with your 'accent' color */}
      <button
        onClick={handleOpenModal}
        className="bg-accent hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
      >
        <Video size={20} />
        Find Virtual Doctors
      </button>

      {/* Pop-up Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Modal Content */}
          <div className="relative bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header - Styled with 'primary' */}
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Virtual Specialists</h2>
                <p className="text-secondary/70 text-sm italic">Available for remote consultations</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto bg-background custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                  <p className="mt-4 text-text-primary font-medium">Searching for doctors...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-danger bg-danger/10 rounded-xl">
                  {error}
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-12 text-text-primary/60">
                  No doctors currently offer virtual consultations.
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doc) => (
                    <div 
                      key={doc._id?.$oid || doc._id} 
                      className="bg-surface border border-secondary p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        <div className="bg-secondary p-3 rounded-full h-fit">
                          <User className="text-primary" size={28} />
                        </div>
                        <div>
                          <h3 className="text-text-primary font-bold text-lg flex items-center gap-2">
                            Dr. {doc.name}
                            {doc.verified && <ShieldCheck size={18} className="text-success" />}
                          </h3>
                          <p className="text-text-secondary font-semibold text-sm uppercase tracking-wide">
                            {doc.specialty}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs">
                             <span className="flex items-center gap-1 text-text-primary/70">
                                <Phone size={14} /> {doc.contactNumber}
                             </span>
                             <span className="flex items-center gap-1 text-success bg-success/10 px-2 py-0.5 rounded">
                                <Video size={14} /> Video Available
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-end">
                        <span className="text-xs text-text-primary/50 font-bold uppercase tracking-tighter">Consultation Fee</span>
                        <span className="text-2xl font-black text-primary">Rs. {doc.consultationFee}</span>
                       
<button 
  onClick={() => {
    onBook(doc); // Pass the whole object 'doc', not just doc._id
    setIsOpen(false);
  }}
  className="..."
>
  Book Now
</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-secondary bg-white text-right">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-text-primary font-bold px-6 py-2 hover:bg-secondary rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualConsultationList;