import React, { useState, useEffect } from 'react';
import { X, Video, Calendar, Clock, Loader2, Stethoscope, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import API from '../../api/axiosClient';
import { PaymentFormInner } from '../payments/PaymentForm'; 

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CreateSessionModal = ({ isOpen, onClose, onRefresh, doctorData }) => {
  const [step, setStep] = useState(0); // 0: Form, 1: Payment, 2: Success
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingResponse, setBookingResponse] = useState(null);
  
  const [formData, setFormData] = useState({
    appointmentId: '',
    doctorId: '',
    scheduledTime: ''
  });

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      const randomID = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        appointmentId: randomID,
        doctorId: doctorData?._id || '',
        scheduledTime: ''
      });
    }
  }, [isOpen, doctorData]);

  // Handle slot filtering (Logic remains the same)
  useEffect(() => {
    if (selectedDate && doctorData?.availability) {
      const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      const slots = doctorData.availability.filter(slot => slot.day === dayName && slot.isAvailable === true);
      setAvailableSlots(slots);
    }
  }, [selectedDate, doctorData]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await API.post('/telemedicine/create', formData);
      setBookingResponse(response.data); 
      setStep(1); // Move to Payment Step
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Check connection"));
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-secondary overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header - Stays consistent */}
        <div className="bg-primary p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Video size={20} className="text-accent" />
            <h2 className="text-lg font-bold">
                {step === 0 && "Schedule Session"}
                {step === 1 && "Complete Payment"}
                {step === 2 && "Booking Confirmed"}
            </h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X size={20}/></button>
        </div>

        <div className="p-6">
          
          {/* STEP 0: BOOKING FORM */}
          {step === 0 && (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
               {/* Doctor Mini-Card */}
               <div className="p-3 bg-secondary/30 rounded-xl border border-secondary flex gap-3 items-center">
                  <div className="bg-white p-2 rounded-full text-accent shadow-sm"><Stethoscope size={20}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">Booking with</p>
                    <p className="text-primary font-bold">{doctorData?.name}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-primary uppercase block mb-1">Date</label>
                    <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 bg-background border border-secondary rounded-lg outline-none focus:ring-2 focus:ring-accent/20" onChange={(e) => setSelectedDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-primary uppercase block mb-1">Time Slot</label>
                    <select required className="w-full px-3 py-2 bg-background border border-secondary rounded-lg outline-none focus:ring-2 focus:ring-accent/20 appearance-none" onChange={(e) => setFormData({...formData, scheduledTime: `${selectedDate}T${e.target.value}`})}>
                      <option value="">Select slot</option>
                      {availableSlots.map(slot => <option key={slot._id} value={slot.startTime}>{slot.startTime}</option>)}
                    </select>
                  </div>
               </div>

               <button type="submit" disabled={isCreating || !formData.scheduledTime} className="w-full bg-accent text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2">
                 {isCreating ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
               </button>
            </form>
          )}

          {/* STEP 1: PAYMENT */}
          {step === 1 && (
            <Elements stripe={stripePromise}>
              <PaymentFormInner 
                appointmentData={{
                  // Pass the ID from the newly created session
                  appointmentId: bookingResponse?.session?._id || bookingResponse?._id,
                  amount: doctorData?.consultationFee || 2500,
                  doctorName: doctorData?.name,
                  type: "Virtual",
                  patientId: loggedInUser.id || loggedInUser._id
                }} 
                onSuccess={() => {
                    setStep(2);
                    onRefresh(); // Refresh table in background
                }} 
              />
            </Elements>
          )}

          {/* STEP 2: SUCCESS */}
          {step === 2 && (
            <div className="py-8 text-center animate-in fade-in zoom-in">
                <div className="bg-success/10 text-success w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold text-primary">Confirmed!</h3>
                <p className="text-text-secondary mt-2">Your virtual session has been scheduled and paid successfully.</p>
                <button 
                    onClick={onClose}
                    className="mt-8 w-full bg-primary text-white font-bold py-3 rounded-xl"
                >
                    View My Sessions
                </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreateSessionModal;