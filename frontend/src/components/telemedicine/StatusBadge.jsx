const StatusBadge = ({ status }) => {
  const statusStyles = {
    COMPLETED: "bg-success/10 text-success border-success/20",
    SCHEDULED: "bg-accent/10 text-accent border-accent/20",
    IN_PROGRESS: "bg-blue-100 text-blue-600 border-blue-200",
    CANCELLED: "bg-danger/10 text-danger border-danger/20",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default StatusBadge;