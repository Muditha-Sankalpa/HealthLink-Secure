import { useEffect, useState } from 'react';
import { PatientNavBar, TabBar } from '../../components/shared';
import { getHistory } from '../../api/patientApi';

const tabs = [
  { key: 'consultations', label: 'Consultations' },
  { key: 'prescriptions', label: 'Prescriptions' },
  { key: 'reports', label: 'Reports' },
];

const MedicalHistory = () => {
  const [data, setData] = useState({ consultations: [], prescriptions: [], reports: [] });
  const [active, setActive] = useState('consultations');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getHistory().then((res) => setData(res.data)).catch(console.error);
  }, []);

  const items = data[active] || [];
  const filtered = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientNavBar requireAuth={false} />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#122056] flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div>
              <h2 className="font-bold text-[#122056] text-lg">Medical History</h2>
            </div>
          </div>

          {/* Tab counts */}
          <div className="flex gap-3 mb-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  active === t.key
                    ? 'bg-[#122056] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label} ({data[t.key]?.length || 0})
              </button>
            ))}
          </div>

          {/* Filter */}
          <input
            placeholder="Filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-4 focus:outline-none focus:border-[#122056]"
          />

          {/* Items */}
          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No records found.</p>
            ) : (
              filtered.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 shadow-sm">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalHistory;