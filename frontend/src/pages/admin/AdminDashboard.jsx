import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, AdminNavBar } from '../../components/shared';
import { getAllPatients, getStats, updatePatientStatus } from '../../api/adminApi';

const BODY_FONT = "'DM Sans', sans-serif";
const HEADING_FONT = "'DM Serif Display', serif";

const StatCard = ({ label, value, accentColor = '#122056' }) => (
  <div style={{
    background: '#fff',
    borderRadius: 16,
    padding: '24px 28px',
    borderLeft: `4px solid ${accentColor}`,
    boxShadow: '0 1px 6px rgba(17,24,39,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  }}>
    <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 700, color: accentColor, fontFamily: HEADING_FONT, lineHeight: 1.1 }}>{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const isActive = status === 'active';
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      border: `1.5px solid ${isActive ? '#16a34a' : '#dc2626'}`,
      color: isActive ? '#16a34a' : '#dc2626',
      background: 'transparent',
    }}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statsError, setStatsError] = useState(null);

  const fetchStats = () => {
    getStats()
      .then((res) => { setStats(res.data); setStatsError(null); })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setStatsError('Could not load stats. Please refresh.');
        }
      });
  };

  const fetchPatients = (q = '') => {
    getAllPatients(q)
      .then((res) => setPatients(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      });
  };

  useEffect(() => {
    fetchStats();
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchPatients(e.target.value);
  };

  const handleToggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'deactivated' : 'active';
    await updatePatientStatus(id, newStatus);
    fetchPatients(search);
    fetchStats();
  };

  const filtered =
    statusFilter === 'all'
      ? patients
      : patients.filter((p) => p.status === statusFilter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .patient-row:hover { background: #f8f9ff !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb', fontFamily: BODY_FONT }}>
        <AdminNavBar />

        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: HEADING_FONT, fontSize: 28, color: '#122056', fontWeight: 400 }}>
              Patients
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              Manage and monitor all registered patients from here
            </div>
          </div>

          {/* Inline stats error */}
          {statsError && (
            <div style={{ marginBottom: 16, padding: '10px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: 10, fontSize: 13 }}>
              {statsError}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            <StatCard label="Total Patients" value={stats.total            ?? 0} accentColor="#122056" />
            <StatCard label="Active"         value={stats.active           ?? 0} accentColor="#16a34a" />
            <StatCard label="Deactivated"    value={stats.deactivated      ?? 0} accentColor="#dc2626" />
            <StatCard label="Within 30 Days" value={stats.newRegistrations ?? 0} accentColor="#5B65DC" />
          </div>

          {/* Table card */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(17,24,39,0.06)', overflow: 'hidden' }}>

            {/* Search + filters bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="1.8" />
                  <path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  placeholder="Search by name..."
                  value={search}
                  onChange={handleSearch}
                  style={{
                    width: '100%',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: '9px 14px 9px 36px',
                    fontSize: 13,
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: BODY_FONT,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'active', 'deactivated'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 999,
                      border: `1.5px solid ${statusFilter === s ? '#122056' : '#e5e7eb'}`,
                      background: statusFilter === s ? '#122056' : '#fff',
                      color: statusFilter === s ? '#fff' : '#6b7280',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: BODY_FONT,
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f5' }}>
                    {[
                      { label: 'NAME',       width: '35%' },
                      { label: 'REGISTERED', width: '25%' },
                      { label: 'STATUS',     width: '20%' },
                      { label: 'ACTIONS',    width: '20%' },
                    ].map((h) => (
                      <th
                        key={h.label}
                        style={{
                          textAlign: 'left',
                          padding: '12px 20px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#9ca3af',
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase',
                          width: h.width,
                          fontFamily: BODY_FONT,
                        }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 13 }}>
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr
                        key={p._id}
                        className="patient-row"
                        style={{ borderBottom: '1px solid #f0f0f5', background: '#fff', transition: 'background 0.15s' }}
                      >
                        {/* Name */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontFamily: 'monospace' }}>
                            {p._id?.toUpperCase().slice(0, 8) + '-' + p._id?.slice(8, 12).toUpperCase() + '...'}
                          </div>
                        </td>

                        {/* Registered */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#9ca3af" strokeWidth="1.8" />
                              <path d="M16 2v4M8 2v4M3 10h18" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                            {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 20px' }}>
                          <StatusBadge status={p.status} />
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px' }}>
                          <button
                            onClick={() => handleToggleStatus(p._id, p.status)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              border: `1.5px solid ${p.status === 'active' ? '#dc2626' : '#16a34a'}`,
                              background: 'transparent',
                              color: p.status === 'active' ? '#dc2626' : '#16a34a',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: BODY_FONT,
                              transition: 'all 0.15s',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;