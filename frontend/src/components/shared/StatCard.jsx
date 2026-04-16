const StatCard = ({ label, value, color = 'text-[#122056]' }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
    <span className={`text-3xl font-bold ${color}`}>{value ?? 0}</span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export default StatCard;