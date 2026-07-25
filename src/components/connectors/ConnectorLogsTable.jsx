import { useState, useEffect } from "react"
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { connectorsApi } from "../../api/connectors"

/*
  ConnectorLogsTable — один компонент на все 4 типа коннекторов,
  колонки параметризуются конфигом по типу. Пагинация/поиск — по
  образцу FindingsPage.jsx.
*/

const COLUMN_CONFIGS = {
  aws_vpc_flow_logs: [
    { key: "start_time", label: "Time" },
    { key: "action", label: "Action", badge: true },
    { key: "srcaddr", label: "Src" },
    { key: "dstaddr", label: "Dst" },
    { key: "srcport", label: "Src Port" },
    { key: "dstport", label: "Dst Port" },
    { key: "protocol", label: "Proto" },
    { key: "bytes", label: "Bytes" },
    { key: "packets", label: "Packets" },
  ],
  aws_waf: [
    { key: "timestamp", label: "Time" },
    { key: "action", label: "Action", badge: true },
    { key: "http_client_ip", label: "Client IP" },
    { key: "http_country", label: "Country" },
    { key: "http_method", label: "Method" },
    { key: "http_uri", label: "URI" },
    { key: "web_acl_name", label: "Web ACL" },
    { key: "terminating_rule_id", label: "Rule" },
  ],
  aws_cloudtrail: [
    { key: "event_time", label: "Time" },
    { key: "event_name", label: "Event" },
    { key: "event_source", label: "Source" },
    { key: "user_name", label: "User" },
    { key: "source_ip_address", label: "Source IP" },
    { key: "aws_region", label: "Region" },
    { key: "error_code", label: "Error" },
  ],
  aws_cloudwatch: [
    { key: "event_timestamp", label: "Time" },
    { key: "log_group", label: "Log Group" },
    { key: "log_stream", label: "Log Stream" },
    { key: "message", label: "Message", truncate: true },
  ],
}

const ACTION_COLORS = {
  ACCEPT: "text-green-400", ALLOW: "text-green-400",
  REJECT: "text-red-400", BLOCK: "text-red-400",
  COUNT: "text-yellow-400", CAPTCHA: "text-yellow-400",
}

function formatCell(value, column) {
  if (value === null || value === undefined || value === "") return "—"
  if (column.key.includes("time") && !column.badge) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
  }
  return value
}

export default function ConnectorLogsTable({ connectorId, connectorType }) {
  const columns = COLUMN_CONFIGS[connectorType] || []
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    loadLogs()
  }, [page])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadLogs()
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await connectorsApi.getLogs(connectorId, {
        page, page_size: pageSize, ...(search && { search }),
      })
      setRows(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg
                       pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600
                       focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 text-sm text-gray-400
                     hover:text-white px-3 py-1.5 bg-gray-800 rounded-lg"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {columns.map((col) => (
                  <th key={col.key} className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                    <RefreshCw className="animate-spin inline mr-2" size={16} />
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                    No logs ingested yet
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-3 whitespace-nowrap ${
                          col.truncate ? "truncate max-w-xs" : ""
                        } ${col.badge ? (ACTION_COLORS[row[col.key]] || "text-gray-400") : "text-gray-300"}`}
                      >
                        {formatCell(row[col.key], col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-gray-800 text-gray-400
                           hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
