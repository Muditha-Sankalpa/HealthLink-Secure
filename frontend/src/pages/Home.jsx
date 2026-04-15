import React from "react";
import { Link } from "react-router-dom";

function Home() {
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
          <button className="bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition">
            Primary Button
          </button>
          <p className="text-[var(--color-text-secondary)] mb-6">
            This is just a sample button. Do not use it ;) <br /> Add your
            buttons below
          </p>
          {/* telemedicine */}
          <Link to="/allSessions">
            <button className="bg-[var(--color-primary)] text-white py-2 rounded-lg hover:opacity-90 transition">
              Telemedicine Sessions
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
