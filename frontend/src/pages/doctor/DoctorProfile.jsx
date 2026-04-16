import { useEffect, useState } from 'react';
import { DoctorNavBar } from '../../components/shared';
import { getProfile, createProfile, updateProfile } from '../../api/doctorApi';

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    licenseNumber: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    contactNumber: '',
    email: '',
    notificationPreference: ['email', 'sms']
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProfile();
      setDoctor(response.data);
      // Pre-fill form
      setForm({
        name: response.data.name || '',
        specialty: response.data.specialty || '',
        licenseNumber: response.data.licenseNumber || '',
        qualification: response.data.qualification || '',
        experience: response.data.experience || '',
        consultationFee: response.data.consultationFee || '',
        contactNumber: response.data.contactNumber || '',
        email: response.data.email || '',
        notificationPreference: response.data.notificationPreference || ['email', 'sms']
      });
    } catch (err) {
      console.error('Fetch profile error:', err);
      if (err.response?.status === 404) {
        setError('Profile not found. Please create your profile first.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError(err.response?.data?.message || 'Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleNotificationChange = (type) => {
    setForm(prev => ({
      ...prev,
      notificationPreference: prev.notificationPreference.includes(type)
        ? prev.notificationPreference.filter(p => p !== type)
        : [...prev.notificationPreference, type]
    }));
  };

  const handleSubmit = async () => {
    try {
      if (doctor) {
        await updateProfile(form);
      } else {
        await createProfile(form);
      }
      setEditing(false);
      fetchProfile(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DoctorNavBar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#122056] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DoctorNavBar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-6 py-2 bg-[#122056] text-white rounded-lg hover:opacity-90 transition"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
          {/* ... rest of your existing profile code ... */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {/* Your existing profile UI here */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#122056] flex items-center justify-center text-white text-3xl font-bold">
                {doctor?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#122056]">{doctor?.name || 'Doctor'}</h2>
                <p className="text-gray-500">{doctor?.specialty || 'Not set'}</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 rounded-lg bg-[#122056] text-white font-semibold hover:opacity-90 transition"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              {['name', 'specialty', 'licenseNumber', 'qualification', 'contactNumber', 'email'].map((field) => (
                <div key={field}>
                  <label className="text-sm text-gray-500 capitalize">{field}</label>
                  <input
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-500">Experience (years)</label>
                <input
                  name="experience"
                  type="number"
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Consultation Fee</label>
                <input
                  name="consultationFee"
                  type="number"
                  value={form.consultationFee}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm text-gray-500 mb-2 block">Notification Preferences</label>
                <div className="flex gap-4">
                  {['email', 'sms'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.notificationPreference.includes(type)}
                        onChange={() => handleNotificationChange(type)}
                        className="w-4 h-4 text-[#122056] rounded focus:ring-[#122056]"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="col-span-2 py-3 rounded-xl bg-[#122056] text-white font-semibold hover:opacity-90 transition"
              >
                {doctor ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div><h3 className="text-sm text-gray-500 mb-1">License Number</h3><p className="font-semibold text-[#122056]">{doctor?.licenseNumber || 'Not set'}</p></div>
              <div><h3 className="text-sm text-gray-500 mb-1">Qualification</h3><p className="font-semibold text-[#122056]">{doctor?.qualification || 'Not set'}</p></div>
              <div><h3 className="text-sm text-gray-500 mb-1">Experience</h3><p className="font-semibold text-[#122056]">{doctor?.experience ? `${doctor.experience} years` : 'Not set'}</p></div>
              <div><h3 className="text-sm text-gray-500 mb-1">Consultation Fee</h3><p className="font-semibold text-[#122056]">{doctor?.consultationFee ? `Rs. ${doctor.consultationFee}` : 'Not set'}</p></div>
              <div><h3 className="text-sm text-gray-500 mb-1">Contact Number</h3><p className="font-semibold text-[#122056]">{doctor?.contactNumber || 'Not set'}</p></div>
              <div><h3 className="text-sm text-gray-500 mb-1">Email</h3><p className="font-semibold text-[#122056]">{doctor?.email || 'Not set'}</p></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;