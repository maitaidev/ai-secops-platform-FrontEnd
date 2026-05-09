import { useState, useEffect } from "react"
import { AlertTriangle, AlertOctagon, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import StatCard from "../components/ui/StatCard"
import SeverityBadge from "../components/ui/SeverityBadge"
import { findingsApi } from "../api/findings"

/*
  DashboardPage — главная страница.

  Секции:
  1. 4 карточки: critical / high / total / resolved
  2. Линейный график трендов за 7 дней
  3. Таблица последних 5 findings
*/

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [trends, setTrends]   = useState([])
  const [recent, setRecent]   = useState([])
  const [loading, setLoading] = useState(true)

  // Загружаем данные при первом рендере
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Загружаем всё параллельно — быстрее чем по очереди
      const [statsData, trendsData, findingsData] = await Promise.all([
        findingsApi.getStats(),
        findingsApi.getTrends(7),
        findingsApi.getAll({ page_size: 5 }),
      ])
      setStats(statsData)
      setTrends(processTrends(trendsData))
      setRecent(findingsData.items)
    } catch (err) {
      console.error("Dashboard load error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Преобразуем данные трендов для Recharts
  const processTrends = (rawData) => {
    // Группируем по дате
    const byDate = {}
    rawData.forEach(({ date, severity, count }) => {
      if (!byDate[date]) byDate[date] = { date }
      byDate[date][severity] = count
    })
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <RefreshCw className="animate-spin mr-2" size={18} />
        Loading dashboard...
      </div>
    )
  }

  const severity = stats?.severity || {}
  const st = stats?.status || {}

  return (
    <div className="space-y-6">

      {/* ── ЗАГОЛОВОК ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Security Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Real-time AWS security monitoring</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 text-sm text-gray-400
                     hover:text-white transition-colors px-3 py-1.5
                     bg-gray-800 rounded-lg"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── STAT CARDS ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Critical"
          value={severity.critical || 0}
          color="red"
          icon={AlertOctagon}
          subtitle="Open findings"
        />
        <StatCard
          title="High"
          value={severity.high || 0}
          color="orange"
          icon={AlertTriangle}
          subtitle="Open findings"
        />
        <StatCard
          title="Total Open"
          value={st.open || 0}
          color="indigo"
          icon={AlertCircle}
          subtitle="Require attention"
        />
        <StatCard
          title="Resolved"
          value={st.resolved || 0}
          color="green"
          icon={CheckCircle}
          subtitle="Last 30 days"
        />
      </div>

      {/* ── ГРАФИК ТРЕНДОВ ─────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">
          Findings Trend — Last 7 Days
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(d) => d.slice(5)}  // показываем MM-DD
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #374151" }}
              labelStyle={{ color: "#9ca3af" }}
            />
            <Legend />
            <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="high"     stroke="#f97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="medium"   stroke="#eab308" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── ПОСЛЕДНИЕ FINDINGS ─────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Recent Findings</h3>
          <a href="/findings" className="text-xs text-indigo-400 hover:text-indigo-300">
            View all →
          </a>
        </div>
        <div className="divide-y divide-gray-800">
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No findings yet
            </p>
          ) : (
            recent.map((f) => (
              <div key={f.id} className="px-5 py-3 flex items-center gap-4">
                <SeverityBadge severity={f.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.resource_id || "unknown resource"}</p>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">
                  {f.source}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
