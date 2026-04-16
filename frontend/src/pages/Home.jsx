import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="bg-[var(--color-surface)] shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Welcome!
        </h1>

        <p className="text-[var(--color-text-secondary)] mb-6">
          This is your healthcare dashboard.
        </p>

        <div className="flex flex-col gap-3">

          {/* Sample button */}
          <button className="bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition">
            Primary Button
          </button>

          <p className="text-[var(--color-text-secondary)] mb-6">
            This is just a sample button. Do not use it ;) <br />
            Add your buttons below
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            Login / Register
          </button>

          {/* Keeping duplicated text (but properly wrapped) */}
          <p className="text-[var(--color-text-secondary)] mb-6">
            This is just a sample button. Do not use it ;) <br />
            Add your buttons below
          </p>

          {/* Patient Dashboard */}
          <button 
            onClick={() => navigate("/patient")}
            className="bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            Patient Dashboard
          </button>

          {/* Telemedicine */}
          <button 
            onClick={() => navigate("/allSessions")}
            className="bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            Telemedicine
          </button>

          <button 
            onClick={() => navigate("/book-appointment")}
            className="bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            Appointment
          </button>
          

        </div>
      </div>
    </div>
  );
}

export default Home;