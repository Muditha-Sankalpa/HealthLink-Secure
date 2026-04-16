import React, { useState, useEffect } from "react";
import API from "../../api/axiosClient";
import { 
  CreditCard, 
  Search, 
  Loader2, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  PlusCircle,
  RefreshCcw,
  Wallet,
  AlertCircle // Added for error display
} from "lucide-react";
import { AdminNavBar, PatientNavBar } from "../../components/shared";
import { useNavigate } from "react-router-dom";

const PaymentsAdmin = () => {
  const navigate = useNavigate();

  // 1. Get user and Role info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role;
  const userId = user?.id || user?._id || user?.name; 
  const isAdmin = userRole === "Admin";
  const isPatient = userRole === "Patient";

  // 2. State Declarations
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // <--- ADD THIS LINE
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  // 3. Fetch Logic with Role-Based URLs
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null); 
      
      let response;
      if (isAdmin) {
        // Admin gets everything
        response = await API.get("/payment");
      } else {
        // Patient gets only their own records
        // Matches your backend route: /patient/:patientId
        response = await API.get(`/payment/patient/${userId}`);
      }

      // Handle both [item, item] and { payments: [item, item] } formats
      const data = Array.isArray(response.data) ? response.data : (response.data.payments || []);
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      // Handle the 403 error gracefully for Patients
      if (err.response?.status === 403) {
        setError("Access Denied: You cannot view these records.");
      } else {
        setError("Failed to load payment history. Please try again later.");
      }
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentIntentId) => {
    if (!isAdmin) return;
    try {
      setConfirmingId(paymentIntentId);
      await API.post("/payment/confirm", { paymentIntentId });
      alert("Payment confirmed successfully!");
      fetchPayments(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm payment");
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]); // Runs on mount and if userId changes

  // Filter for Search Bar
  const filteredPayments = payments.filter(p => 
    p.paymentIntentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.appointmentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculation
  const totalAmount = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  const formatDate = (dateString) => {
    if(!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SUCCESS': return "bg-green-100 text-green-700 border-green-200";
      case 'PENDING': return "bg-amber-100 text-amber-700 border-amber-200";
      case 'FAILED': return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      {isAdmin ? <AdminNavBar /> : <PatientNavBar />}

      <div style={{ flex: 1, overflowY: "auto" }} className="p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary italic font-serif">
              {isAdmin ? "Financial Overview" : "My Payments"}
            </h1>
            <p className="text-text-secondary">
              {isAdmin ? "Track all hospital transactions" : "History of your consultation fees"}
            </p>
          </div>

          
            
<button
  onClick={() => navigate('/payment', {
    state: {
      appointmentData: {
        amount: 3500,
        doctorName: "Dr. Admin Test",
        type: "Internal",
        appointmentId: `TEST-${Date.now()}`,
        patientId: userId 
      }
    }
  })}
  className="bg-success hover:brightness-110 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md group"
>
  <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
  <span>Initiate Test Payment</span>
</button>
          
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              {isAdmin ? <DollarSign size={24}/> : <Wallet size={24}/>}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                {isAdmin ? "Total Revenue" : "Total Spent"}
              </p>
              <p className="text-2xl font-bold text-primary">LKR {totalAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24}/></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Successful</p>
              <p className="text-2xl font-bold text-green-600">{payments.filter(p => p.status === 'SUCCESS').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Clock size={24}/></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl border border-secondary overflow-hidden shadow-sm">
          <div className="p-4 border-b border-secondary bg-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search history..."
                className="w-full pl-10 pr-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchPayments} className="text-accent text-sm font-medium hover:underline flex items-center gap-2">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center text-text-secondary"><Loader2 className="animate-spin mb-2" /> Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/30 border-b border-secondary">
                    <th className="px-6 py-4 font-bold text-primary">Transaction</th>
                    {isAdmin && <th className="px-6 py-4 font-bold text-primary">Patient ID</th>}
                    <th className="px-6 py-4 font-bold text-primary">Appointment</th>
                    <th className="px-6 py-4 font-bold text-primary">Amount</th>
                    <th className="px-6 py-4 font-bold text-primary">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{p.paymentIntentId.substring(0, 16)}...</td>
                      {isAdmin && <td className="px-6 py-4">{p.patientId}</td>}
                      <td className="px-6 py-4 text-gray-500">{p.appointmentId}</td>
                      <td className="px-6 py-4 font-bold">LKR {p.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAdmin && p.status === 'PENDING' ? (
                          <button
                            onClick={() => handleConfirmPayment(p.paymentIntentId)}
                            disabled={confirmingId === p.paymentIntentId}
                            className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                          >
                            {confirmingId === p.paymentIntentId ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                            Confirm
                          </button>
                        ) : (
                          <div className={`text-xs font-bold flex items-center justify-end gap-1 ${p.status === 'SUCCESS' ? 'text-success' : 'text-gray-400'}`}>
                            {p.status === 'SUCCESS' ? <CheckCircle size={14} /> : <Clock size={14} />}
                            {p.status === 'SUCCESS' ? 'Verified' : 'Processing'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && !loading && (
                <div className="p-12 text-center text-gray-400 italic">No payments found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsAdmin;