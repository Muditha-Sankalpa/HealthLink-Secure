import { useState } from 'react';
import { PatientNavBar } from '../../components/shared';
import { uploadReport } from '../../api/patientApi';

const UploadReport = () => {
  const [form, setForm] = useState({ reportType: '', description: '', fileUrl: '' });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    await uploadReport(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientNavBar requireAuth={true} />
      <main className="flex-1 p-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-[#122056] mb-6">Upload Medical Reports</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 mb-6 bg-gray-50">
            <span className="text-4xl">📄</span>
            <p className="text-gray-500 text-sm">Upload your report details below</p>
          </div>
          <div className="flex flex-col gap-4">
            <input
              name="reportType"
              placeholder="Report Type (e.g. Blood Test)"
              value={form.reportType}
              onChange={handleChange}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-[#122056]"
            />
            <input
              name="fileUrl"
              placeholder="File URL"
              value={form.fileUrl}
              onChange={handleChange}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-[#122056]"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-[#122056]"
            />
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-[#122056] text-white font-semibold hover:opacity-90 transition"
            >
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadReport;