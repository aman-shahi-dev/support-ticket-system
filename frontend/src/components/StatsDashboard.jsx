export default function StatsDashboard({ stats }) {
  if (!stats) return null;

  const {
    total_tickets = 0,
    open_tickets = 0,
    avg_tickets_per_day = 0,
    priority_breakdown = {},
    category_breakdown = {},
  } = stats;

  return (
    <div className="w-full md:w-1/2 bg-white rounded-xl shadow-2xl p-6 m-6">
      <h2 className="text-xl font-bold mb-4 text-center">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total Tickets"
          value={total_tickets}
          color="text-orange-400"
          border="border-t-4 border-t-orange-400"
        />
        <MetricCard
          label="Open Tickets"
          value={open_tickets}
          color="text-blue-600"
          border="border-t-4 border-t-orange-400"
        />
        <MetricCard
          label="Avg / Day"
          value={avg_tickets_per_day}
          color="text-green-600"
          border="border-t-4 border-t-orange-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Breakdown
          title="Priority Breakdown"
          data={priority_breakdown}
          colorMap={{
            low: "bg-gray-400",
            medium: "bg-blue-500",
            high: "bg-yellow-500",
            critical: "bg-red-500",
          }}
        />
        <Breakdown
          title="Category Breakdown"
          data={category_breakdown}
          colorMap={{
            billing: "bg-purple-500",
            technical: "bg-cyan-500",
            account: "bg-emerald-500",
            general: "bg-orange-400",
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, border }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 text-center ${border}`}>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function Breakdown({ title, data, colorMap }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, count]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-20 text-xs text-gray-600 capitalize">{key}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${colorMap[key] || "bg-gray-400"}`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-5 text-right">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
