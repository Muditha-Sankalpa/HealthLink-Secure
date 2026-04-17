import React, { useState, useEffect } from "react";
import API from "../../api/axiosClient";
import { 
  Search, 
  Loader2, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  PlusCircle,
  RefreshCcw,
  Wallet,
  AlertCircle,
  Calendar,
  Copy
} from "lucide-react";
import { AdminNavBar, PatientNavBar } from "../../components/shared";
import { useNavigate } from "react-router-dom";

const PaymentsAdmin = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role;
  const userId = user?.id || user?._id; 
  const isAdmin = userRole === "Admin";

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = isAdmin ? "/payment" : `/payment/patient/${userId}`;
      const response = await API.get(endpoint);
      const data = Array.isArray(response.data) ? response.data : (response.data.payments || []);
      setPayments(data);
    } catch (err) {
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [userId]);

  const handleConfirmPayment = async (paymentIntentId) => {
    try {
      setConfirmingId(paymentIntentId);
      await API.post("/payment/confirm", { paymentIntentId });
      fetchPayments(); 
    } catch (err) {
      alert("Verification failed");
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.paymentIntentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.appointmentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      {isAdmin ? <AdminNavBar /> : <PatientNavBar />}

      <div style={{ flex: 1, p: 8 }} className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary italic font-serif">
              {isAdmin ? "Accounting Ledger" : "Billing History"}
            </h1>
            <p className="text-text-secondary text-sm">View and verify hospital transactions</p>
          </div>
          {/* <button
            onClick={() => navigate('/payment', { state: { appointmentData: { amount: 3500, doctorName: "Dr. Admin", patientId: userId }}})}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg"
          >
            <PlusCircle size={18} /> New Payment
          </button> */}
        </div>

        {/* Simple Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-secondary shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={20}/></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Total {isAdmin ? 'Revenue' : 'Spent'}</span>
            </div>
            <p className="text-2xl font-bold text-primary">LKR {payments.filter(p=>p.status==='SUCCESS').reduce((s,p)=>s+p.amount,0).toLocaleString()}</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-secondary shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20}/></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{payments.filter(p=>p.status==='SUCCESS').length}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-secondary shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20}/></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Pending Approval</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{payments.filter(p=>p.status==='PENDING').length}</p>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl border border-secondary shadow-sm overflow-hidden">
          <div className="p-4 border-b border-secondary flex justify-between bg-gray-50/50">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" placeholder="Search Transaction ID..." 
                className="w-full pl-9 pr-4 py-1.5 border border-secondary rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchPayments} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><RefreshCcw size={18} className="text-gray-500" /></button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-gray-400 border-b border-secondary bg-gray-50/30">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Transaction Reference</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary text-sm">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[11px] text-gray-800 flex items-center gap-2">
                        {p.paymentIntentId.substring(0, 18)}...
                        <button onClick={() => navigator.clipboard.writeText(p.paymentIntentId)} className="text-gray-300 hover:text-primary"><Copy size={12}/></button>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Appt ID: {p.appointmentId}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      LKR {p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`mx-auto w-fit px-2.5 py-1 rounded-full text-[10px] font-black border ${
                        p.status === 'SUCCESS' ? 'bg-green-100 text-green-700 border-green-200' :
                        p.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {p.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && p.status === 'PENDING' ? (
                        <button
                          onClick={() => handleConfirmPayment(p.paymentIntentId)}
                          className="bg-accent text-white px-3 py-1 rounded-md text-xs font-bold hover:shadow-md transition-all"
                        >
                          Verify
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">No Action Req.</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsAdmin;