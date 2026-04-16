import { useEffect, useState } from 'react';
import { DoctorNavBar } from '../../components/shared';
import { getPrescriptionHistory, issuePrescription } from '../../api/doctorApi';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: '', appointmentId: '', diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: '', followUpDate: ''
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = () => {
    getPrescriptionHistory().then((res) => setPrescriptions(res.data)).catch(console.error);
  };

  const handleMedicationChange = (index, field, value) => {
    const newMeds = [...form.medications];
    newMeds[index][field] = value;
    setForm({ ...form, medications: newMeds });
  };

  const addMedication = () => {
    setForm({
      ...form,
      medications: [...form.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const removeMedication = (index) => {
    setForm({ ...form, medications: form.medications.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    await issuePrescription(form);
    setShowForm(false);
    setForm({
      patientId: '', appointmentId: '', diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: '', followUpDate: ''
    });
    fetchPrescriptions();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#122056]">Prescription History</h1>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg bg-[#122056] text-white font-semibold hover:opacity-90 transition">
              {showForm ? 'Cancel' : 'Issue New Prescription'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-[#122056] mb-4">Issue Prescription</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-500">Patient ID</label>
                  <input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]" placeholder="Enter patient ID" />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Appointment ID</label>
                  <input value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]" placeholder="Enter appointment ID" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Diagnosis</label>
                  <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]" placeholder="Enter diagnosis" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-500 mb-2 block">Medications</label>
                {form.medications.map((med, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 mb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Medication Name" value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#122056]" />
                      <input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#122056]" />
                      <input placeholder="Frequency" value={med.frequency} onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#122056]" />
                      <input placeholder="Duration" value={med.duration} onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#122056]" />
                      <input placeholder="Instructions" value={med.instructions} onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)} className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#122056]" />
                    </div>
                    {form.medications.length > 1 && <button onClick={() => removeMedication(index)} className="mt-2 text-red-500 text-sm hover:underline">Remove</button>}
                  </div>
                ))}
                <button onClick={addMedication} className="text-[#122056] text-sm font-semibold hover:underline">+ Add Another Medication</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]" placeholder="Additional notes" />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Follow-up Date</label>
                  <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-[#122056]" />
                </div>
              </div>

              <button onClick={handleSubmit} className="w-full py-3 rounded-xl bg-[#122056] text-white font-semibold hover:opacity-90 transition">Issue Prescription</button>
            </div>
          )}

          <div className="grid gap-4">
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">No prescriptions issued yet</div>
            ) : (
              prescriptions.map((rx) => (
                <div key={rx._id} className="bg-white rounded-2xl shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#122056]">Diagnosis: {rx.diagnosis}</h3>
                      <p className="text-sm text-gray-500">Issued: {new Date(rx.createdAt).toLocaleDateString()}</p>
                    </div>
                    {rx.followUpDate && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Follow-up: {new Date(rx.followUpDate).toLocaleDateString()}</span>}
                  </div>
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Medications:</h4>
                    {rx.medications.map((med, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2">
                        <p className="font-semibold text-[#122056]">{med.name} - {med.dosage}</p>
                        <p className="text-sm text-gray-600">{med.frequency} for {med.duration}</p>
                        {med.instructions && <p className="text-sm text-gray-500 italic">{med.instructions}</p>}
                      </div>
                    ))}
                  </div>
                  {rx.notes && <div className="border-t border-gray-200 pt-3"><p className="text-sm text-gray-600"><strong>Notes:</strong> {rx.notes}</p></div>}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Prescriptions;