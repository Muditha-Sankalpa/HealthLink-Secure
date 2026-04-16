import { useEffect, useState } from 'react';
import { DoctorNavBar } from '../../components/shared';
// ✅ FIX 1: Rename API import to avoid collision with React state setter
import { getProfile, setAvailability as saveAvailabilityAPI } from '../../api/doctorApi';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Availability = () => {
  // ✅ Local UI state
  const [availability, setAvailability] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing availability or initialize defaults
  useEffect(() => {
    getProfile()
      .then((res) => {
        if (res.data.availability && res.data.availability.length > 0) {
          setAvailability(res.data.availability);
        } else {
          const defaultAvail = days.map((day) => ({
            day,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: false,
          }));
          setAvailability(defaultAvail);
        }
      })
      .catch((err) => console.error('Failed to load availability:', err))
      .finally(() => setLoading(false));
  }, []);

  // Toggle availability checkbox
  const handleToggle = (index) => {
    const newAvail = [...availability];
    newAvail[index].isAvailable = !newAvail[index].isAvailable;
    setAvailability(newAvail);
  };

  // Update start/end time
  const handleTimeChange = (index, field, value) => {
    const newAvail = [...availability];
    newAvail[index][field] = value;
    setAvailability(newAvail);
  };

  // Save to backend
  const handleSave = async () => {
    try {
      setLoading(true);
      // ✅ FIX 2: Call the API function (renamed import)
      await saveAvailabilityAPI({ availability });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save availability. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && availability.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DoctorNavBar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-gray-500">Loading availability...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-[#122056] mb-6">Set Availability</h1>

          {saved && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              ✅ Availability saved successfully!
            </div>
          )}

          <div className="space-y-4 mb-6">
            {availability.map((slot, index) => (
              <div key={slot.day} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#122056]">{slot.day}</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slot.isAvailable}
                      onChange={() => handleToggle(index)}
                      className="w-4 h-4 text-[#122056] rounded focus:ring-[#122056]"
                    />
                    <span className="text-sm">Available</span>
                  </label>
                </div>

                {slot.isAvailable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Start Time</label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">End Time</label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#122056] text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Availability'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Availability;