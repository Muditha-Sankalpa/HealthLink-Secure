import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, StatCard, AdminNavBar } from '../../components/shared';
import { getAllPatients, getStats, updatePatientStatus } from '../../api/adminApi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    getStats().then((res) => setStats(res.data)).catch(() => navigate('/auth'));
    fetchPatients();
  }, []);

  const fetchPatients = (q = '') => {
    getAllPatients(q).then((res) => setPatients(res.data)).catch(() => {});
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchPatients(e.target.value);
  };

  const handleToggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'deactivated' : 'active';
    await updatePatientStatus(id, newStatus);
    fetchPatients(search);
    getStats().then((res) => setStats(res.data));
  };

  const filtered = statusFilter === 'all'
    ? patients
    : patients.filter((p) => p.status === statusFilter);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb' }}>
      <AdminNavBar />

      <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard label="Total" value={stats.total ?? 0} />
          <StatCard label="Active" value={stats.active ?? 0} color="text-green-600" />
          <StatCard label="Deactivated" value={stats.deactivated ?? 0} color="text-red-500" />
          <StatCard label="New (30d)" value={stats.newRegistrations ?? 0} color="text-blue-500" />
        </div>

        {/* Status filter tabs + search */}
        <Card className="rounded-2xl">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'active', 'deactivated'].map((s) => (
                <Button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  variant={statusFilter === s ? 'primary' : 'secondary'}
                  className="rounded-full capitalize"
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
            <input
              placeholder="Search by name..."
              value={search}
              onChange={handleSearch}
              style={{
                border: '1px solid #d1d5db', borderRadius: 10,
                padding: '8px 14px', fontSize: 13, minWidth: 220
              }}
            />
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#122056', color: '#fff' }}>
                  {['Name', 'Status', 'Registered', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>No patients found.</td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr key={p._id} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '0.5px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827' }}>{p.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                          background: p.status === 'active' ? '#d1fae5' : '#fee2e2',
                          color: p.status === 'active' ? '#065f46' : '#991b1b'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Button
                          onClick={() => handleToggleStatus(p._id, p.status)}
                          variant={p.status === 'active' ? 'danger' : 'primary'}
                        >
                          {p.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;