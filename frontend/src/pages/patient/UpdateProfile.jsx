import { useEffect, useState } from 'react';
import { PatientNavBar } from '../../components/shared';
import { getProfile, updateProfile } from '../../api/patientApi';

const UpdateProfile = () => {
  const [form, setForm] = useState({ name: '', contactNumber: '', dateOfBirth: '', gender: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then((res) => {
      const { name, contactNumber, dateOfBirth, gender } = res.data;
      setForm({ name, contactNumber, dateOfBirth: dateOfBirth?.slice(0, 10), gender });
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientNavBar requireAuth={false} />
      <main className="flex-1 p-8">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-[#122056] mb-6">Update Profile</h2>
          <div className="flex flex-col gap-4">
            {['name', 'contactNumber', 'dateOfBirth'].map((field) => (
              <div key={field}>
                <label className="text-sm text-gray-500 capitalize">{field}</label>
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  type={field === 'dateOfBirth' ? 'date' : 'text'}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]"
                />
              </div>
            ))}
            <div>
              <label className="text-sm text-gray-500">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-[#122056] text-white font-semibold hover:opacity-90 transition"
            >
              {saved ? 'Saved!' : 'Update'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateProfile;