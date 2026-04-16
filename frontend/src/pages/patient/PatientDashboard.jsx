import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, createProfile, updateProfile, updateAvatar, uploadReport, deleteReport, getHistory, getMyAppointments, getScheduledTelemedicine } from '../../api/patientApi';
import { Button, Card, PatientNavBar, ErrorMessage } from '../../components/shared';

const BODY_FONT = "'DM Sans', sans-serif";
const HEADING_FONT = "'DM Serif Display', serif";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('profile');
  const [patient, setPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saveMsg, setSaveMsg] = useState('');
  const [history, setHistory] = useState({ reports: [], prescriptions: [], consultations: [] });
  const [appointments, setAppointments] = useState([]);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('consultations');
  const [expandedConsultation, setExpandedConsultation] = useState(null);
  const [expandedPrescription, setExpandedPrescription] = useState(null);
  const [reportForm, setReportForm] = useState({ file: null });
  const [reportMsg, setReportMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('');
  const [confirmDeleteReportId, setConfirmDeleteReportId] = useState(null);
  const medicalHistoryRef = useRef(null);

  const refreshHistory = async () => {
    try {
      const res = await getHistory();
      setHistory(res.data);
    } catch {
      // keep existing history snapshot on refresh error
    }
  };

  const getStoredUser = () => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const bootstrapProfileIfMissing = async () => {
    const storedUser = getStoredUser();
    if (!storedUser) return;
    try {
      await createProfile({
        name: storedUser?.name || '',
        email: storedUser?.email || '',
        dob: '',
        gender: '',
        contactNumber: '',
        address: '',
        bloodGroup: '',
        notificationPreference: [],
      });
    } catch {
      // ignore bootstrap failures (may already exist or backend errors)
    }
  };

  useEffect(() => {
    getProfile()
      .then((res) => {
        console.log('Patient data:', res.data);
        setPatient(res.data);
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          dob: res.data.dob?.slice(0, 10) || '',
          gender: res.data.gender || '',
          contactNumber: res.data.contactNumber || '',
          address: res.data.address || '',
          bloodGroup: res.data.bloodGroup || '',
          notificationPreference: res.data.notificationPreference || [],
        });
        getScheduledTelemedicine()
          .then((r) => setScheduledSessions(r.data))
          .catch(() => {});
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401) {
          navigate('/login');
          return;
        }

        if (status === 404) {
          bootstrapProfileIfMissing()
            .then(() => Promise.all([getProfile(), getHistory()]))
            .then(([profileRes, historyRes]) => {
              setPatient(profileRes.data);
              setForm({
                name: profileRes.data.name || '',
                email: profileRes.data.email || '',
                dob: profileRes.data.dob?.slice(0, 10) || '',
                gender: profileRes.data.gender || '',
                contactNumber: profileRes.data.contactNumber || '',
                address: profileRes.data.address || '',
                bloodGroup: profileRes.data.bloodGroup || '',
                notificationPreference: profileRes.data.notificationPreference || [],
              });
              setHistory(historyRes.data);
            })
            .catch(() => {
              setSaveMsg('Profile not found yet. Please update your profile to create it.');
              setTimeout(() => setSaveMsg(''), 4000);
            });
          return;
        }

        const apiMessage = err?.response?.data?.message;
        setSaveMsg(apiMessage || 'Could not load your profile. Please make sure the backend is running.');
        setTimeout(() => setSaveMsg(''), 4000);
      });

    refreshHistory();

    getMyAppointments()
      .then((res) => setAppointments(res.data))
      .catch(() => {});
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await updateProfile(form);
      if (res?.data) {
        setPatient(res.data);
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          dob: res.data.dob?.slice(0, 10) || '',
          gender: res.data.gender || '',
          contactNumber: res.data.contactNumber || '',
          address: res.data.address || '',
          bloodGroup: res.data.bloodGroup || '',
          notificationPreference: res.data.notificationPreference || [],
        });
      }
      setSaveMsg('Profile updated successfully.');
      setEditMode(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Update failed. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!reportForm.file) {
      setReportMsg('Please select a file.');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', reportForm.file);
      await uploadReport(formData);
      await refreshHistory();
      setReportMsg('Report uploaded successfully.');
      setUploadedFile({
        name: reportForm.file.name,
        sizeKb: Math.max(1, Math.round(reportForm.file.size / 1024)),
      });
      setReportForm({ file: null });
      setTimeout(() => setReportMsg(''), 3000);
    } catch {
      setReportMsg('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    setConfirmDeleteReportId(reportId);
  };

  const confirmDeleteReport = async () => {
    const reportId = confirmDeleteReportId;
    if (!reportId) return;
    try {
      await deleteReport(reportId);
      await refreshHistory();
      setConfirmDeleteReportId(null);
    } catch {
      setSaveMsg('Failed to delete report. Please try again.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const cancelDeleteReport = () => setConfirmDeleteReportId(null);

  const goToMedicalHistoryPrescriptions = () => {
    setActiveTab('prescriptions');
    setActiveNav('profile');
    setTimeout(() => {
      medicalHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const toggleNotifPref = (pref) => {
    const current = form.notificationPreference || [];
    const updated = current.includes(pref)
      ? current.filter((p) => p !== pref)
      : [...current, pref];
    setForm({ ...form, notificationPreference: updated });
  };

  const filterItems = (items) => {
    if (!historyFilter) return items;
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(historyFilter.toLowerCase())
    );
  };

  const initials = patient?.name
    ? patient.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const notificationCount = 2 + (history?.prescriptions?.length > 0 ? 1 : 0);

  const resolveAvatarUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await updateAvatar(formData);
      if (res?.data) setPatient(res.data);
    } catch {
      setSaveMsg('Avatar upload failed. Please try again.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status !== 'Cancelled');

  const UploadWidget = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.7 1.6A3.5 3.5 0 0 1 18.5 18H7Z"
              stroke="#111827"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 14V9" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M9.5 11.5 12 9l2.5 2.5" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Upload files</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Select and upload the files of your choice</div>
        </div>
      </div>

      <div style={{ border: '1.5px dashed #d1d5db', borderRadius: 12, padding: '24px 14px', textAlign: 'center', background: '#fafafa' }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto 10px' }} aria-hidden="true">
          <path
            d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.7 1.6A3.5 3.5 0 0 1 18.5 18H7Z"
            stroke="#111827"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 14V8.7" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9.5 11.5 12 9l2.5 2.5" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>Choose a file or drag & drop it here.</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>JPEG, PNG, PDF, and MP4 formats, up to 50 MB.</div>
        <label style={{ display: 'inline-block', marginTop: 10 }}>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.mp4"
            onChange={(e) => setReportForm({ file: e.target.files?.[0] || null })}
            style={{ display: 'none' }}
          />
          <span style={{ border: '1px solid #d1d5db', borderRadius: 10, padding: '7px 16px', fontSize: 13, color: '#374151', cursor: 'pointer', background: '#fff' }}>Browse File</span>
        </label>
      </div>

      {(uploading || reportForm.file) && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', background: '#fafafa' }}>
          <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{reportForm.file?.name || 'uploading-file.pdf'}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
            {(reportForm.file ? Math.max(1, Math.round(reportForm.file.size / 1024)) : 60)} KB • {uploading ? 'Uploading...' : 'Ready to upload'}
          </div>
          <div style={{ height: 6, borderRadius: 8, background: '#e5e7eb', marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: uploading ? '60%' : '100%', background: '#4f63d8' }} />
          </div>
        </div>
      )}

      {uploadedFile && !uploading && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', background: '#fff' }}>
          <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{uploadedFile.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{uploadedFile.sizeKb} KB • Completed</div>
        </div>
      )}

      {reportMsg && (
        <div style={{ fontSize: 11, color: reportMsg.includes('success') ? '#059669' : '#dc2626' }}>
          {reportMsg}
        </div>
      )}
      <Button onClick={handleUpload} variant="primary">Save</Button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .history-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(17, 24, 39, 0.28) transparent;
        }
        .history-scroll::-webkit-scrollbar { width: 10px; }
        .history-scroll::-webkit-scrollbar-track { background: transparent; }
        .history-scroll::-webkit-scrollbar-thumb {
          background: rgba(17, 24, 39, 0.22);
          border-radius: 999px;
          border: 3px solid rgba(255, 255, 255, 0.9);
        }
        .history-scroll::-webkit-scrollbar-thumb:hover { background: rgba(17, 24, 39, 0.32); }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb', fontFamily: BODY_FONT }}>
        <PatientNavBar />

      <div style={{ flex: 1, height: '100vh', boxSizing: 'border-box', padding: 28, overflow: 'hidden', position: 'relative' }}>
        {confirmDeleteReportId && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(17,24,39,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: 16,
            }}
            onClick={cancelDeleteReport}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 520,
                background: '#fff',
                border: '1px solid rgba(17,24,39,0.08)',
                borderRadius: 16,
                boxShadow: '0 18px 50px rgba(17,24,39,0.18)',
                padding: 16,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ErrorMessage message="Are you sure you want to delete this report?" />
              <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={cancelDeleteReport}>Cancel</Button>
                <Button variant="danger" onClick={confirmDeleteReport}>Delete</Button>
              </div>
            </div>
          </div>
        )}

          {/* ── PROFILE VIEW ── */}
          {activeNav === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'stretch', height: '100%' }}>

              <Card className="flex flex-col gap-3 rounded-2xl" style={{ height: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingBottom: 16, borderBottom: '0.5px solid #e5e7eb' }}>
                  <div style={{ position: 'relative' }}>
                    {patient?.avatarUrl ? (
                      <img src={resolveAvatarUrl(patient.avatarUrl)} alt="avatar" style={{ width: 132, height: 132, borderRadius: 18, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 132, height: 132, borderRadius: 18, background: '#122056', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 44, fontWeight: 500 }}>
                        {initials}
                      </div>
                    )}
                    <label style={{ position: 'absolute', bottom: 8, right: 8, background: '#122056', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 15V5M8 9l4-4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#122056' }}>{patient?.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Patient</div>
                </div>

                <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(7, minmax(0, 1fr))', gap: 10 }}>
                  {[
                    ['Name', 'name', 'text'],
                    ['Email', 'email', 'email'],
                    ['Date of Birth', 'dob', 'date'],
                    ['Gender', 'gender', 'select'],
                    ['Contact No.', 'contactNumber', 'text'],
                    ['Address', 'address', 'text'],
                    ['Blood Group', 'bloodGroup', 'text'],
                  ].map(([label, key, type]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{label}</span>
                      {editMode ? (
                        type === 'select' ? (
                          <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px', fontSize: 13 }} />
                        )
                      ) : (
                        <span style={{ fontSize: 13, color: '#111827' }}>
                          {key === 'dob' && patient?.[key] ? new Date(patient[key]).toLocaleDateString() : patient?.[key] || '—'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: 8, borderTop: '0.5px solid #e5e7eb' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Notification preference</span>
                  <div style={{ display: 'flex', gap: 14 }}>
                    {['email', 'sms'].map((pref) => (
                      <label key={pref} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.notificationPreference?.includes(pref) || false} onChange={() => editMode && toggleNotifPref(pref)} disabled={!editMode} />
                        {pref.charAt(0).toUpperCase() + pref.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                {saveMsg && (
                  <div style={{ fontSize: 12, color: saveMsg.includes('success') ? '#059669' : '#dc2626', padding: '6px 10px', borderRadius: 6, background: saveMsg.includes('success') ? '#d1fae5' : '#fee2e2' }}>
                    {saveMsg}
                  </div>
                )}

                {editMode ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button onClick={handleUpdate} variant="primary" className="flex-1">Save</Button>
                    <Button onClick={() => setEditMode(false)} variant="secondary" className="flex-1">Cancel</Button>
                  </div>
                ) : (
                  <Button onClick={() => setEditMode(true)} variant="primary" className="w-full">Update profile</Button>
                )}
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, height: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Card className="rounded-2xl">
                    <div style={{ fontSize: 16, fontWeight: 500, color: '#122056', marginBottom: 12, fontFamily: HEADING_FONT }}>Upload medical reports</div>
                    <UploadWidget />
                  </Card>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: '#e8f0fe', border: '0.5px solid #b5d4f4', borderRadius: 16, padding: 16, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0c447c', marginBottom: 4, fontFamily: HEADING_FONT }}>Make appointment</div>
                      <div style={{ fontSize: 11, color: '#185fa5', marginBottom: 12 }}>Book a session with a doctor</div>
                      <Button variant="primary" onClick={() => navigate('/book-appointment')}>Book now</Button>
                    </div>
                  <div style={{ position: 'relative', background: '#eef2ff', border: '0.5px solid #dbe2ff', borderRadius: 16, padding: 16, flex: 1, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(800px 220px at 20% 10%, rgba(91, 101, 220, 0.16) 0%, rgba(91, 101, 220, 0) 60%), radial-gradient(800px 220px at 80% 90%, rgba(34, 211, 165, 0.12) 0%, rgba(34, 211, 165, 0) 60%)' }} />
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: HEADING_FONT }}>Notification Center</div>
                        <button
                          type="button"
                          onClick={() => setActiveNav('notifications')}
                          style={{ position: 'relative', border: '1px solid rgba(17,24,39,0.12)', background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '6px 10px', fontSize: 12, color: '#111827', cursor: 'pointer' }}
                        >
                          View all
                          <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: '#dc2626', color: '#fff', fontSize: 11, lineHeight: '18px', textAlign: 'center', fontWeight: 700 }}>
                            {notificationCount}
                          </span>
                        </button>
                      </div>

                      <div style={{ display: 'grid', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(17,24,39,0.08)' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(91,101,220,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B65DC', flexShrink: 0, marginTop: 2, fontWeight: 700 }}>•</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Appointment reminder</div>
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>You have an upcoming appointment. Check your schedule.</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(17,24,39,0.08)' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(34,211,165,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f6e56', flexShrink: 0, marginTop: 2, fontWeight: 700 }}>•</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Telemedicine session reminder</div>
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Your virtual session is scheduled. Check your consultations.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>

                <div ref={medicalHistoryRef} style={{ minHeight: 0, flex: 1, display: 'flex' }}>
                <Card className="rounded-2xl" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#122056', marginBottom: 16, fontFamily: HEADING_FONT }}>Medical History</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {[
                      { key: 'consultations', label: `Consultations (${history.consultations?.length || 0})` },
                      { key: 'prescriptions', label: `Prescriptions (${history.prescriptions?.length || 0})` },
                      { key: 'reports', label: `Reports (${history.reports?.length || 0})` },
                    ].map((tab) => (
                      <Button key={tab.key} onClick={() => setActiveTab(tab.key)} variant={activeTab === tab.key ? 'primary' : 'secondary'} className="rounded-full">
                        {tab.label}
                      </Button>
                    ))}
                    <div style={{ marginLeft: 'auto' }}>
                      <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '5px 10px', fontSize: 12 }}>
                        <option value="">Filter by date</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>
                  </div>

                <div className="history-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'scroll', minHeight: 0, flex: 1, paddingRight: 6, scrollbarGutter: 'stable both-edges' }}>
                    {filterItems(history[activeTab] || []).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>No records found.</div>
                    ) : (
                      filterItems(history[activeTab] || []).map((item, i) => (
                        <div key={i} style={{ border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}>
                          {activeTab === 'consultations' && (() => {
                            const id = item?._id;
                            const isExpanded = expandedConsultation === id;
                            const truncatedSession = item?.sessionId ? `${item.sessionId.slice(0, 8)}...` : (item?._id ? `${item._id.slice(0, 8)}...` : '—');
                            return (
                              <div>
                                <button type="button" onClick={() => id && setExpandedConsultation((prev) => prev === id ? null : id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>Session — {truncatedSession}</div>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Status: {item.status} | {item.scheduledTime ? new Date(item.scheduledTime).toLocaleDateString() : ''}</div>
                                  </div>
                                  <span style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                                    {isExpanded ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                  </span>
                                </button>
                                {isExpanded && (
                                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid #e5e7eb', display: 'grid', gap: 6 }}>
                                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Session ID:</span> {item.sessionId || '—'}</div>
                                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Appointment ID:</span> {item.appointmentId || '—'}</div>
                                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Scheduled Time:</span> {item.scheduledTime ? new Date(item.scheduledTime).toLocaleString() : '—'}</div>
                                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>End Time:</span> {item.endTime ? new Date(item.endTime).toLocaleString() : '—'}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          {activeTab === 'prescriptions' && (() => {
                            const id = item?._id;
                            const isExpanded = expandedPrescription === id;
                            const medsSummary = item.medications?.map((m) => m.name).filter(Boolean).join(', ');
                            return (
                              <div>
                                <button type="button" onClick={() => id && setExpandedPrescription((prev) => prev === id ? null : id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{item.diagnosis}</div>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{medsSummary} | {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</div>
                                  </div>
                                  <span style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                                    {isExpanded ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                  </span>
                                </button>
                                {isExpanded && (
                                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid #e5e7eb', display: 'grid', gap: 8 }}>
                                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Appointment ID:</span> {item.appointmentId || '—'}</div>
                                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Notes:</span> {item.notes || '—'}</div>
                                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Follow-up Date:</span> {item.followUpDate ? new Date(item.followUpDate).toLocaleDateString() : '—'}</div>
                                    <div style={{ fontSize: 12, color: '#374151' }}>
                                      <div style={{ color: '#6b7280', marginBottom: 6 }}>Medications:</div>
                                      {Array.isArray(item.medications) && item.medications.length > 0 ? (
                                        <div style={{ display: 'grid', gap: 6 }}>
                                          {item.medications.map((m, idx) => (
                                            <div key={idx} style={{ padding: '8px 10px', borderRadius: 10, background: '#fafafa', border: '0.5px solid #e5e7eb' }}>
                                              <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{m?.name || '—'}</div>
                                              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{[m?.dosage && `Dosage: ${m.dosage}`, m?.frequency && `Frequency: ${m.frequency}`, m?.duration && `Duration: ${m.duration}`].filter(Boolean).join(' • ') || '—'}</div>
                                              {m?.instructions && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>Instructions: {m.instructions}</div>}
                                            </div>
                                          ))}
                                        </div>
                                      ) : <div style={{ fontSize: 11, color: '#9ca3af' }}>—</div>}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          {activeTab === 'reports' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{item.fileName || item.reportType}</div>
                                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{item.fileType} | {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {item.fileUrl && (
                                  <a href={item.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#122056', textDecoration: 'underline' }}>
                                    View
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReport(item._id)}
                                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af' }}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
                </div>
              </div>
            </div>
          )}

          {/* ── MEDICAL HISTORY VIEW ── */}
          {activeNav === 'history' && (
            <div style={{ height: '100%', minHeight: 0 }}>
              <Card className="rounded-2xl" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#122056', marginBottom: 16, fontFamily: HEADING_FONT }}>Medical history</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { key: 'consultations', label: `Consultations (${history.consultations?.length || 0})` },
                    { key: 'prescriptions', label: `Prescriptions (${history.prescriptions?.length || 0})` },
                    { key: 'reports', label: `Reports (${history.reports?.length || 0})` },
                  ].map((tab) => (
                    <Button key={tab.key} onClick={() => setActiveTab(tab.key)} variant={activeTab === tab.key ? 'primary' : 'secondary'} className="rounded-full">
                      {tab.label}
                    </Button>
                  ))}
                  <div style={{ marginLeft: 'auto' }}>
                    <select style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 10px', fontSize: 12 }} onChange={(e) => setHistoryFilter(e.target.value)}>
                      <option value="">Filter by date</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                </div>
                <input placeholder="Search..." onChange={(e) => setHistoryFilter(e.target.value)} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 10, padding: '8px 12px', fontSize: 13, marginBottom: 14, boxSizing: 'border-box' }} />
              <div className="history-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, flex: 1, overflowY: 'scroll', paddingRight: 6, scrollbarGutter: 'stable both-edges' }}>
                  {filterItems(history[activeTab] || []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>No records found.</div>
                  ) : (
                    filterItems(history[activeTab] || []).map((item, i) => (
                      <div key={i} style={{ border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                        {activeTab === 'consultations' ? (() => {
                          const id = item?._id;
                          const isExpanded = expandedConsultation === id;
                          const truncatedSession = item?.sessionId ? `${item.sessionId.slice(0, 8)}...` : (item?._id ? `${item._id.slice(0, 8)}...` : '—');
                          return (
                            <>
                              <button type="button" onClick={() => id && setExpandedConsultation((prev) => prev === id ? null : id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>Session — {truncatedSession}</div>
                                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{item.scheduledTime ? new Date(item.scheduledTime).toLocaleDateString() : ''}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: item.status === 'COMPLETED' ? '#d1fae5' : '#f3f4f6', color: item.status === 'COMPLETED' ? '#065f46' : '#6b7280' }}>{item.status || 'Uploaded'}</span>
                                  <span style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                                    {isExpanded ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                  </span>
                                </div>
                              </button>
                              {isExpanded && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #e5e7eb', display: 'grid', gap: 7 }}>
                                  <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Session ID:</span> {item.sessionId || '—'}</div>
                                  <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Appointment ID:</span> {item.appointmentId || '—'}</div>
                                  <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Scheduled Time:</span> {item.scheduledTime ? new Date(item.scheduledTime).toLocaleString() : '—'}</div>
                                  <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>End Time:</span> {item.endTime ? new Date(item.endTime).toLocaleString() : '—'}</div>
                                </div>
                              )}
                            </>
                          );
                        })() : activeTab === 'prescriptions' ? (() => {
                          const id = item?._id;
                          const isExpanded = expandedPrescription === id;
                          const medsSummary = item.medications?.map((m) => m.name).filter(Boolean).join(', ');
                          return (
                            <>
                              <button type="button" onClick={() => id && setExpandedPrescription((prev) => prev === id ? null : id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{item.diagnosis}</div>
                                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{medsSummary}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: '#f3f4f6', color: '#6b7280' }}>Issued</span>
                                  <span style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                                    {isExpanded ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                  </span>
                                </div>
                              </button>
                              {isExpanded && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #e5e7eb', display: 'grid', gap: 8 }}>
                                  <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Appointment ID:</span> {item.appointmentId || '—'}</div>
                                  <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Notes:</span> {item.notes || '—'}</div>
                                  <div style={{ fontSize: 12, color: '#374151' }}><span style={{ color: '#6b7280' }}>Follow-up Date:</span> {item.followUpDate ? new Date(item.followUpDate).toLocaleDateString() : '—'}</div>
                                  <div style={{ fontSize: 12, color: '#374151' }}>
                                    <div style={{ color: '#6b7280', marginBottom: 6 }}>Medications:</div>
                                    {Array.isArray(item.medications) && item.medications.length > 0 ? (
                                      <div style={{ display: 'grid', gap: 6 }}>
                                        {item.medications.map((m, idx) => (
                                          <div key={idx} style={{ padding: '8px 10px', borderRadius: 10, background: '#fafafa', border: '0.5px solid #e5e7eb' }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{m?.name || '—'}</div>
                                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{[m?.dosage && `Dosage: ${m.dosage}`, m?.frequency && `Frequency: ${m.frequency}`, m?.duration && `Duration: ${m.duration}`].filter(Boolean).join(' • ') || '—'}</div>
                                            {m?.instructions && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>Instructions: {m.instructions}</div>}
                                          </div>
                                        ))}
                                      </div>
                                    ) : <div style={{ fontSize: 11, color: '#9ca3af' }}>—</div>}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })() : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{item.fileName || item.reportType}</div>
                              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{item.fileType}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {item.fileUrl && (
                                <a href={item.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#122056', textDecoration: 'underline' }}>
                                  View
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteReport(item._id)}
                                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af' }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ── UPLOAD VIEW ── */}
          {activeNav === 'upload' && (
            <div style={{ maxWidth: 500 }}>
              <Card className="rounded-2xl">
                <div style={{ fontSize: 16, fontWeight: 500, color: '#122056', marginBottom: 16, fontFamily: HEADING_FONT }}>Upload medical reports</div>
                <UploadWidget />
              </Card>
            </div>
          )}

          {/* ── NOTIFICATIONS VIEW ── */}
          {activeNav === 'notifications' && (
            <div style={{ maxWidth: 560 }}>
              <Card className="rounded-2xl">
                <div style={{ fontSize: 16, fontWeight: 500, color: '#122056', marginBottom: 16, fontFamily: HEADING_FONT }}>My notifications</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {upcomingAppointments.length > 0 ? (
                    <div style={{ border: '0.5px solid #b5d4f4', borderRadius: 10, padding: '14px 16px', background: '#e8f0fe' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0c447c' }}>Appointment reminder</div>
                      <div style={{ fontSize: 12, color: '#185fa5', marginTop: 3 }}>
                        You have {upcomingAppointments.length} upcoming appointment(s).{' '}
                        <a href="/book-appointment" style={{ color: '#185fa5', fontWeight: 500, textDecoration: 'underline' }}>View</a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', background: '#f9fafb' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>Appointment reminder</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>No upcoming appointments.</div>
                    </div>
                  )}

                  {scheduledSessions.length > 0 ? (
                    <div style={{ border: '0.5px solid #9fe1cb', borderRadius: 10, padding: '14px 16px', background: '#e1f5ee' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#085041' }}>Telemedicine session reminder</div>
                      <div style={{ fontSize: 12, color: '#0f6e56', marginTop: 3 }}>
                        You have {scheduledSessions.length} scheduled session(s).{' '}
                        <a href="/allSessions" style={{ color: '#0f6e56', fontWeight: 500, textDecoration: 'underline' }}>View</a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', background: '#f9fafb' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>Telemedicine session reminder</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>No scheduled sessions.</div>
                    </div>
                  )}

                  {history.prescriptions?.length > 0 && (
                    <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Prescription issued</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                      You have {history.prescriptions.length} prescription(s).{' '}
                      <button
                        type="button"
                        onClick={goToMedicalHistoryPrescriptions}
                        style={{ background: 'transparent', border: 'none', padding: 0, color: '#122056', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
                      >
                        View in Medical History
                      </button>
                      .
                      </div>
                    </div>
                  )}

                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default PatientDashboard;