import { useState, useEffect } from "react"
import { RefreshCw, ChevronDown, Table2 } from "lucide-react"
import { connectorsApi } from "../api/connectors"

/*
  TablesPage — Integrations & Data → Tables.
  Список всех лог-таблиц коннекторов (VPC / WAF / CloudTrail / CloudWatch)
  с их полной схемой полей и количеством строк. Схема приходит с backend'а
  интроспекцией SQLAlchemy-моделей — всегда синхронна с реальной БД.
*/

function TableCard({ table }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border text-indigo-400 bg-indigo-950 border-indigo-900">
            <Table2 size={16} />
          </div>
          <div className="text-left">
            <p className="text-white font-medium">{table.label}</p>
            <p className="text-xs text-gray-500 font-mono">{table.table_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {table.row_count.toLocaleString()} rows · {table.columns.length} fields
          </span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-2 uppercase tracking-wider">Field</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-2 uppercase tracking-wider">Type</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-2 uppercase tracking-wider">Nullable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {table.columns.map((col) => (
                <tr key={col.name}>
                  <td className="px-5 py-2 text-gray-200 font-mono text-xs">{col.name}</td>
                  <td className="px-5 py-2 text-gray-400 font-mono text-xs">{col.type}</td>
                  <td className="px-5 py-2 text-gray-500 text-xs">{col.nullable ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function TablesPage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    setLoading(true)
    try {
      const data = await connectorsApi.getTables()
      setTables(data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Tables</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Схема лог-таблиц всех коннекторов — поля, типы, количество строк
          </p>
        </div>
        <button
          onClick={loadTables}
          className="flex items-center gap-2 text-sm text-gray-400
                     hover:text-white px-3 py-1.5 bg-gray-800 rounded-lg"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-10 text-center">Loading...</p>
      ) : (
        <div className="space-y-3">
          {tables.map((table) => (
            <TableCard key={table.table_name} table={table} />
          ))}
        </div>
      )}
    </div>
  )
}
