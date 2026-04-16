import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BrandLogo = () => (
  <img
    src="/LOGO.png"
    alt="HealthLink Logo"
    style={{
      borderRadius: 10,
      objectFit: "cover",
    }}
  />
);

// ── Floating particle background ─────────────────────────────────────────────
const Particles = () => {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 10,
    opacity: 0.08 + Math.random() * 0.12,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {dots.map((d) => (
        <div
          key={d.id}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "#5B65DC",
            opacity: d.opacity,
            animation: `floatUp ${d.duration}s ${d.delay}s infinite ease-in-out alternate`,
          }}
        />
      ))}
    </div>
  );
};

// ── Feature card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay, onClick, cta }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#122056" : "#fff",
        border: `1.5px solid ${hovered ? "#5B65DC" : "#E8EAF4"}`,
        borderRadius: 20,
        padding: "28px 24px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 40px rgba(18,32,86,0.18)"
          : "0 2px 12px rgba(18,32,86,0.06)",
        animation: `fadeUp 0.5s ${delay}s both`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: hovered ? "rgba(91,101,220,0.25)" : "#EEEFFD",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          transition: "background 0.3s",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: "'DM Serif Display', serif",
            fontSize: 17,
            color: hovered ? "#fff" : "#122056",
            fontWeight: 400,
            transition: "color 0.3s",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: hovered ? "rgba(255,255,255,0.7)" : "#8A90B8",
            lineHeight: 1.6,
            transition: "color 0.3s",
          }}
        >
          {desc}
        </p>
      </div>
      {cta && (
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            fontWeight: 600,
            color: hovered ? "#8B92F0" : "#5B65DC",
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "color 0.3s",
          }}
        >
          {cta}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6h8M7 3l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// ── Stat pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ value, label, delay }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 16,
      padding: "16px 24px",
      textAlign: "center",
      animation: `fadeUp 0.5s ${delay}s both`,
    }}
  >
    <div
      style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 28,
        color: "#fff",
        lineHeight: 1,
        marginBottom: 4,
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
      {label}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #FAFAFD; color: #122056; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatUp {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-30px) scale(1.2); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(91,101,220,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 12px rgba(91,101,220,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(91,101,220,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .nav-link {
          font-size: 14px;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }
        .hero-btn-primary {
          height: 50px;
          padding: 0 28px;
          background: #fff;
          color: #122056;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.2);
        }
        .hero-btn-outline {
          height: 50px;
          padding: 0 28px;
          background: transparent;
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.5);
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hero-btn-outline:hover {
          background: rgba(255,255,255,0.1);
          border-color: #fff;
        }
      `}</style>

      <Particles />

      {/* ── Navbar ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 40px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(18,32,86,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            <BrandLogo />
          </div>
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 20,
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            HealthLink
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#services" className="nav-link">Services</a>
          {isLoggedIn ? (
            <>
            <button
              onClick={() => navigate("/patient")}
              className="hero-btn-primary"
              style={{ height: 38, padding: "0 20px", fontSize: 13, marginLeft: 8 }}
            >
              My Dashboard →
            </button>
            <button
              onClick={handleLogout}
              className="hero-btn-outline"
              style={{ height: 38, padding: "0 20px", fontSize: 13, marginLeft: 8 }}
            >
              Logout
            </button>
          </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hero-btn-primary"
              style={{ height: 38, padding: "0 20px", fontSize: 13, marginLeft: 8 }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0D1B4B 0%, #122056 40%, #1a2d6b 70%, #1e3575 100%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(91,101,220,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(91,101,220,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />

        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,101,220,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(91,101,220,0.2)",
            border: "1px solid rgba(91,101,220,0.4)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 28,
            animation: "fadeUp 0.4s 0.1s both",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22C55E",
              animation: "pulse-ring 2s infinite",
            }}
          />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500, letterSpacing: "0.3px" }}>
            Smart Healthcare Platform — Now Live
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            color: "#fff",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: 780,
            marginBottom: 24,
            animation: "fadeUp 0.5s 0.2s both",
          }}
        >
          Healthcare that moves{" "}
          <span
            style={{
              fontStyle: "italic",
              background: "linear-gradient(90deg, #8B92F0, #5B65DC, #22C55E, #8B92F0)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite",
            }}
          >
            with you
          </span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.65)",
            textAlign: "center",
            maxWidth: 520,
            lineHeight: 1.7,
            marginBottom: 40,
            animation: "fadeUp 0.5s 0.3s both",
            fontWeight: 300,
          }}
        >
          Book appointments, track your health, and connect with top specialists —
          all in one beautifully simple platform.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeUp 0.5s 0.4s both",
            marginBottom: 64,
          }}
        >
          <button className="hero-btn-primary" onClick={() => navigate(isLoggedIn ? "/patient/appointments" : "/login")}>
            {isLoggedIn ? "📅 Book Appointment" : "Get Started Free"}
          </button>
          <button className="hero-btn-outline" onClick={() => navigate(isLoggedIn ? "/patient" : "/allSessions")}>
            {isLoggedIn ? "View Dashboard" : "Explore Telemedicine"}
          </button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            maxWidth: 480,
            width: "100%",
            animation: "fadeUp 0.5s 0.5s both",
          }}
        >
          <StatPill value="500+" label="Doctors" delay={0.5} />
          <StatPill value="24/7" label="Support" delay={0.6} />
          <StatPill value="98%" label="Satisfaction" delay={0.7} />
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#5B65DC",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: 12,
              animation: "fadeUp 0.5s 0.1s both",
            }}
          >
            Why HealthLink
          </p>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#122056",
              lineHeight: 1.2,
              animation: "fadeUp 0.5s 0.2s both",
            }}
          >
            Everything you need,<br />
            <span style={{ fontStyle: "italic", color: "#5B65DC" }}>nothing you don't</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          <FeatureCard
            icon="📅"
            title="Smart Appointment Booking"
            desc="Real-time slot availability, automatic queue assignment, and instant confirmation — no phone calls needed."
            delay={0.1}
            onClick={() => navigate(isLoggedIn ? "/patient/appointments" : "/login")}
            cta="Book now"
          />
          <FeatureCard
            icon="🩺"
            title="Telemedicine Consultations"
            desc="Connect with specialists via HD video from anywhere in Sri Lanka. Secure, private, and reliable."
            delay={0.2}
            onClick={() => navigate("/allSessions")}
            cta="Join a session"
          />
          <FeatureCard
            icon="📋"
            title="Digital Health Records"
            desc="Upload reports, track prescriptions, and share records securely with your care team."
            delay={0.3}
            onClick={() => navigate(isLoggedIn ? "/patient/upload-report" : "/login")}
            cta="Manage records"
          />
          <FeatureCard
            icon="📋"
            title="AI Symptom Checker"
            desc="Get instant insights into your health concerns and recommendations to doctor specialties with our AI-powered symptom analysis."
            delay={0.3}
            onClick={() => navigate(isLoggedIn ? "/patient/symptom-checker" : "/login")}
            cta="Check symptoms"
          />
          <FeatureCard
            icon="🔔"
            title="Appointment Reminders"
            desc="SMS and push notifications so you never miss a consultation again."
            delay={0.4}
            cta="Coming soon"
          />
          <FeatureCard
            icon="👨‍⚕️"
            title="Top Verified Specialists"
            desc="Every doctor is licensed, credential-verified, and rated by real patients."
            delay={0.5}
            cta="Meet our doctors"
          />
          <FeatureCard
            icon="🔒"
            title="Private & Secure"
            desc="Your health data is encrypted end-to-end. We comply with the highest medical data standards."
            delay={0.6}
          />
        </div>
      </section>

      {/* ── Services CTA Banner ── */}
      <section
        id="services"
        style={{
          margin: "0 24px 96px",
          borderRadius: 28,
          background: "linear-gradient(135deg, #122056 0%, #1e3575 50%, #5B65DC 100%)",
          padding: "64px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
          flexWrap: "wrap",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "40px solid rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: -80,
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "30px solid rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 520, position: "relative" }}>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(24px, 3vw, 36px)",
              color: "#fff",
              marginBottom: 12,
              lineHeight: 1.25,
            }}
          >
            Ready to take control of your health?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, fontWeight: 300 }}>
            Join thousands of patients already using HealthLink to manage their care smarter.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "relative" }}>
          <button
            className="hero-btn-primary"
            onClick={() => navigate(isLoggedIn ? "/patient" : "/login")}
          >
            {isLoggedIn ? "Go to Dashboard →" : "Create Free Account"}
          </button>
          <button
            className="hero-btn-outline"
            onClick={() => navigate("/allSessions")}
          >
            Explore Telemedicine
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#0D1B4B",
          padding: "40px 40px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            <BrandLogo />
          </div>
                        
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#fff" }}>
            HealthLink
          </span>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.3px" }}>
          © 2026 HealthLink Medical System · Smart Healthcare Platform
        </p>

        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact"].map((l) => (
            <span
              key={l}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
            >
              {l}
            </span>
          ))}
        </div>
      </footer>
    </>
  );
}