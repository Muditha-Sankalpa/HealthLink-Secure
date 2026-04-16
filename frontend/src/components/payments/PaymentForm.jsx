import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import API from '../../api/axiosClient';
import { useLocation, useNavigate } from 'react-router-dom';

// Initialize Stripe outside of the component to avoid re-initializing on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentFormInner = ({ appointmentData, onSuccess }) => {
    if (!appointmentData) {
    return <div className="p-8 text-center">No appointment data found. Please go back and try again.</div>;
  }
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const elementOptions = {
    style: {
      base: {
        fontSize: '15px',
        color: '#122056', // Using your primary color
        fontFamily: 'Inter, sans-serif',
        '::placeholder': { color: '#8a90b8' },
      },
      invalid: { color: '#DC2626' }, // Using your danger color
    },
  };

  // Inside PaymentFormInner in PaymentForm.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!stripe || !elements) return;

  setIsProcessing(true);
  setErrorMessage('');

  try {
    // 1. Create Intent
    const { data: { clientSecret } } = await API.post('/payment/create-intent', {
      amount: appointmentData.amount,
      appointmentId: appointmentData.appointmentId,
      patientId: appointmentData.patientId,
      currency: 'usd'
    });

    // 2. Stripe Confirmation
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: { name: cardholderName },
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      
      // --- ADD THIS NEW PART ---
      // 3. Call your Backend Confirm API to update MongoDB to "SUCCESS"
      await API.post("/payment/confirm", { 
        paymentIntentId: result.paymentIntent.id 
      });
      // -------------------------

      onSuccess(result.paymentIntent);
    }
  } catch (err) {
    setErrorMessage(err.response?.data?.message || "Payment failed.");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="fade-up w-full max-w-md mx-auto">
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "var(--color-primary)", marginBottom: 4 }}>
        Payment
      </h2>
      <p style={{ fontSize: 13, color: "#8a90b8", marginBottom: 28 }}>
        Your appointment is reserved. Complete payment to confirm.
      </p>

      {/* Summary Card */}
      <div style={{
        background: "linear-gradient(135deg, var(--color-primary) 0%, #1e3a8a 100%)",
        borderRadius: 16, padding: "28px 24px", marginBottom: 24, color: "#fff",
      }}>
        <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20 }}>
          Consultation Fee
        </div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, marginBottom: 4 }}>
          LKR {appointmentData?.amount?.toLocaleString() || "0"}.00
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {appointmentData.doctorName} · {appointmentData.type} Visit
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#122056] mb-2">Card Number</label>
          <div className="border border-[#EEEFFD] rounded-xl p-3.5 bg-white focus-within:border-accent transition-colors shadow-sm">
            <CardNumberElement options={elementOptions} />
          </div>
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#122056] mb-2">Expiry Date</label>
            <div className="border border-[#EEEFFD] rounded-xl p-3.5 bg-white shadow-sm">
              <CardExpiryElement options={elementOptions} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#122056] mb-2">CVV</label>
            <div className="border border-[#EEEFFD] rounded-xl p-3.5 bg-white shadow-sm">
              <CardCvcElement options={elementOptions} />
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#122056] mb-2">Cardholder Name</label>
          <input 
            type="text"
            placeholder="Full name on card"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="w-full border border-[#EEEFFD] rounded-xl p-3 text-[15px] focus:outline-none focus:border-accent shadow-sm"
            required
          />
        </div>

        {/* Demo Warning (from your dummy UI) */}
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 8, padding: "10px 14px", marginTop: 20,
          fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L1.5 4v4C1.5 10.8 4 13 7 13.8 10 13 12.5 10.8 12.5 8V4L7 1z" stroke="#15803d" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          Secure SSL encrypted payment.
        </div>

        {errorMessage && (
          <div className="text-red-500 text-xs font-medium p-2 bg-red-50 rounded-lg">{errorMessage}</div>
        )}

        <button 
          disabled={!stripe || isProcessing}
          type="submit"
          className="w-full bg-success text-white font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:bg-gray-400 mt-4"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="4" width="14" height="9" rx="2" stroke="#fff" strokeWidth="1.3" />
                <path d="M1 7h14" stroke="#fff" strokeWidth="1.3" />
              </svg>
              Pay LKR {appointmentData.amount?.toLocaleString()}.00
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Main Exported Component
const PaymentComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Define your Hardcoded values here
  const hardcodedData = {
    amount: 2500,
    doctorName: "Dr. Demo Specialist",
    type: "Virtual",
    appointmentId: "DEMO_ID_12345",
    patientId: "DEMO_USER_001"
  };

  // 2. Try to get real data from navigation state, OR use hardcoded fallback
  const appointmentData = location.state?.appointmentData || hardcodedData;

  const handleSuccess = (paymentIntent) => {
    console.log("Payment Successful:", paymentIntent);
    alert("Payment Successful! (Demo Mode)");
    navigate('/allPayments');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFD] py-12 px-4">
      {/* 3. Small banner to show we are in demo mode if data is hardcoded */}
      {!location.state?.appointmentData && (
        <div className="max-w-md mx-auto mb-4 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-xs text-center">
          <strong>Demo Mode:</strong> Using hardcoded payment data.
        </div>
      )}

      <Elements stripe={stripePromise}>
        <PaymentFormInner 
          appointmentData={appointmentData} 
          onSuccess={handleSuccess} 
        />
      </Elements>
    </div>
  );
};

export default PaymentComponent;