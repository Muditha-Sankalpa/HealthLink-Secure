import React, { useState, useEffect } from "react";
import API from "../../api/axiosClient";
import { 
  CreditCard, 
  Search, 
  Loader2, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Filter,
  PlusCircle,
  RefreshCcw 
} from "lucide-react";
import { AdminNavBar } from "../../components/shared";
import { useNavigate } from "react-router-dom";

const PaymentsAdmin = () => {
    const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await API.get("/payment"); // Adjust to your actual route
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentIntentId) => {
    try {
      setConfirmingId(paymentIntentId);
      // Calling your backend API: POST http://localhost:5005/api/payment/confirm
      await API.post("/payment/confirm", { paymentIntentId });
      
      alert("Payment confirmed successfully!");
      fetchPayments(); // Refresh list to show SUCCESS status
    } catch (err) {
      console.error("Confirmation error:", err);
      alert(err.response?.data?.message || "Failed to confirm payment");
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.paymentIntentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.appointmentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics Calculation
  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  const formatDate = (dateString) => {
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
      <AdminNavBar />

      <div style={{ flex: 1, overflowY: "auto" }} className="p-8">
        {/* Header */}
         <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary italic font-serif">Financial Overview</h1>
            <p className="text-text-secondary">Track all transaction history and payment statuses</p>
          </div>

          {/* TEMPORARY INITIATE PAYMENT BUTTON */}
          <button
            onClick={() => navigate('/payment', {
              state: {
                appointmentData: {
                  amount: 3500, // Testing a different amount
                  doctorName: "Dr. Admin Test",
                  type: "Internal",
                  appointmentId: `TEST-${Date.now()}`, // Unique ID for testing
                  patientId: "ADMIN-MOCK-USER"
                }
              }
            })}
            className="bg-success hover:brightness-110 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md group"
          >
            <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
            <span>Initiate Test Payment</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary"><DollarSign size={24}/></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">LKR {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24}/></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed</p>
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

        {/* Payments Table */}
        <div className="bg-surface rounded-xl border border-secondary overflow-hidden shadow-sm">
          <div className="p-4 border-b border-secondary bg-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by Patient ID or Transaction ID..."
                className="w-full pl-10 pr-4 py-2 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchPayments} className="text-accent text-sm font-medium hover:underline flex items-center gap-2">
              Refresh Data
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center text-text-secondary"><Loader2 className="animate-spin mb-2" /> Loading Transactions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 border-b border-secondary">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Transaction Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Patient / Appt</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-primary">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded text-gray-500"><CreditCard size={16}/></div>
                          <div>
                            <div className="text-sm font-semibold text-primary">{p.paymentIntentId.substring(0, 12)}...</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{p.paymentMethod}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-primary font-medium">{p.patientId}</div>
                        <div className="text-[10px] text-gray-400">Ref: {p.appointmentId}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        {p.currency.toUpperCase()} {p.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-primary">
                        {formatDate(p.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {p.status === 'PENDING' ? (
                          <button
                            onClick={() => handleConfirmPayment(p.paymentIntentId)}
                            disabled={confirmingId === p.paymentIntentId}
                            className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto hover:brightness-110 transition-all disabled:opacity-50"
                          >
                            {confirmingId === p.paymentIntentId ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <RefreshCcw size={14} />
                            )}
                            Confirm
                          </button>
                        ) : (
                          <div className="text-success flex items-center justify-end gap-1 text-xs font-bold">
                            <CheckCircle size={14} /> Verified
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && (
                <div className="p-12 text-center text-gray-400 italic">No transactions found matching your criteria.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsAdmin;