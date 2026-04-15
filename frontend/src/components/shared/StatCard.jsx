const StatCard = ({ label, value, color = 'text-primary' }) => (
  <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-1 min-w-[120px]">
    <span className={`text-3xl font-bold ${color}`}>{value}</span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export default StatCard;