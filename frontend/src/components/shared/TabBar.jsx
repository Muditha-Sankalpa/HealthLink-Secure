const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex gap-2 border-b border-gray-200 mb-4">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${
          active === tab.key
            ? 'bg-[#122056] text-white'
            : 'text-gray-500 hover:text-[#122056]'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default TabBar;