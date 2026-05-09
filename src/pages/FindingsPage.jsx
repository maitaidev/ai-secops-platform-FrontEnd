import { useState, useEffect } from "react"
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import SeverityBadge from "../components/ui/SeverityBadge"
import { findingsApi } from "../api/findings"

/*
  FindingsPage — таблица всех security findings с фильтрами.

  Фичи:
  - Фильтр по severity (all / critical / high / medium / low)
  - Фильтр по статусу (all / open / in_review / resolved)
  - Поиск по названию
  - Пагинация
  - Изменение статуса прямо из таблицы
*/

const SEVERITY_OPTIONS = ["all", "critical", "high", "medium", "low"]
const STATUS_OPTIONS   = ["all", "open", "in_review", "resolved", "false_positive"]

export default function FindingsPage() {
  const [findings, setFindings]   = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(true)

  // Фильтры
  const [severity, setSeverity] = useState("all")
  const [status, setStatus]     = useState("all")
  const [search, setSearch]     = useState("")

  const pageSize = 20

  // Перезагружаем при изменении любого фильтра или страницы
  useEffect(() => {
    loadFindings()
  }, [page, severity, status])

  // Поиск с задержкой (debounce) — не дёргаем API на каждую букву
  useEffect(() => {
    const timer = setTimeout(() => loadFindings(), 400)
    return () => clearTimeout(timer)   // отменяем предыдущий таймер
  }, [search])

  const loadFindings = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        page_size: pageSize,
        ...(severity !== "all" && { severity }),
        ...(status   !== "all" && { status }),
        ...(search               && { search }),
      }
      const data = await findingsApi.getAll(params)
      setFindings(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await findingsApi.updateStatus(id, newStatus)
      // Обновляем локально — не перезагружаем всю страницу
      setFindings(prev =>
        prev.map(f => f.id === id ? { ...f, status: newStatus } : f)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const statusColors = {
    open:          "text-red-400",
    in_review:     "text-yellow-400",
    resolved:      "text-green-400",
    false_positive:"text-gray-400",
  }

  return (
    <div className="space-y-4">

      {/* ── ЗАГОЛОВОК ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Security Findings</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} findings total</p>
        </div>
        <button
          onClick={loadFindings}
          className="flex items-center gap-2 text-sm text-gray-400
                     hover:text-white px-3 py-1.5 bg-gray-800 rounded-lg"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── ФИЛЬТРЫ ────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4
                      flex flex-wrap gap-3 items-center">

        {/* Поиск */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search findings..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg
                       pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600
                       focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Severity фильтр */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          {SEVERITY_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setSeverity(s); setPage(1) }}
              className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors ${
                severity === s
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status фильтр */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="bg-gray-800 border border-gray-700 text-sm text-gray-300
                     rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {/* ── ТАБЛИЦА ────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Severity</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Title</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Source</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Resource</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Status</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  <RefreshCw className="animate-spin inline mr-2" size={16} />
                  Loading...
                </td>
              </tr>
            ) : findings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No findings found
                </td>
              </tr>
            ) : (
              findings.map((f) => (
                <tr key={f.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-white font-medium truncate max-w-xs">{f.title}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-400 capitalize">{f.source}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs truncate max-w-32">
                    {f.resource_id || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`capitalize text-xs ${statusColors[f.status] || "text-gray-400"}`}>
                      {f.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={f.status}
                      onChange={(e) => handleStatusChange(f.id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-xs text-gray-300
                                 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_review">In Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="false_positive">False Positive</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── ПАГИНАЦИЯ ──────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-gray-800 text-gray-400
                           hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded bg-gray-800 text-gray-400
                           hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
