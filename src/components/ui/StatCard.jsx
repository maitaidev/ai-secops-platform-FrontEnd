/*
  StatCard — карточка с метрикой на дашборде.

  Пример:
  <StatCard title="Critical" value={3} color="red" icon={AlertTriangle} />
*/

export default function StatCard({ title, value, color = "indigo", icon: Icon, subtitle }) {
  const colors = {
    red:    "text-red-400 bg-red-950 border-red-900",
    orange: "text-orange-400 bg-orange-950 border-orange-900",
    yellow: "text-yellow-400 bg-yellow-950 border-yellow-900",
    green:  "text-green-400 bg-green-950 border-green-900",
    indigo: "text-indigo-400 bg-indigo-950 border-indigo-900",
    gray:   "text-gray-400 bg-gray-800 border-gray-700",
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-semibold text-white">
            {value ?? "—"}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colors[color]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
