import { useEffect, useState } from 'react';
import { AdminNavBar, StatCard } from '../../components/shared';
import { getAllPatients, getStats, updatePatientStatus } from '../../api/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getStats().then((res) => setStats(res.data));
    fetchPatients();
  }, []);

  const fetchPatients = (q = '') => {
    getAllPatients(q).then((res) => setPatients(res.data));
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchPatients(e.target.value);
  };

  const handleToggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'deactivated' : 'active';
    await updatePatientStatus(id, newStatus);
    fetchPatients(search);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNavBar requireAuth={false} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#122056] mb-6">Patient Management</h1>

        {/* Stats */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <StatCard label="Total" value={stats.total || 0} />
          <StatCard label="Active" value={stats.active || 0} color="text-green-600" />
          <StatCard label="Deactivated" value={stats.deactivated || 0} color="text-red-500" />
          <StatCard label="New (30d)" value={stats.newRegistrations || 0} color="text-blue-500" />
        </div>

        {/* Search */}
        <input
          placeholder="Search by name..."
          value={search}
          onChange={handleSearch}
          className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2 mb-4 focus:outline-none focus:border-[#122056]"
        />

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#122056] text-white">
              <tr>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Registered</th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr key={p._id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleToggleStatus(p._id, p.status)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        p.status === 'active'
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {p.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;