import { useState, useEffect, useRef } from "react"
import { Play, ChevronDown, Table2, AlertCircle } from "lucide-react"
import { connectorsApi } from "../api/connectors"

/*
  QueryPage — Integrations & Data → Query.
  Слева: SQL-редактор (read-only SELECT по лог-таблицам) + результаты.
  Справа: список таблиц с полями — клик по таблице/полю подставляет их в запрос.
  Backend разрешает только SELECT по белому списку таблиц (см. connector_query.py).
*/

function SchemaSidebar({ tables, onInsertTable, onInsertField }) {
  const [openTable, setOpenTable] = useState(null)

  return (
    <div className="w-72 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Tables</p>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {tables.map((table) => (
          <div key={table.table_name} className="border-b border-gray-800 last:border-b-0">
            <button
              onClick={() => setOpenTable((t) => (t === table.table_name ? null : table.table_name))}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-800/50 transition-colors"
            >
              <span
                onClick={(e) => { e.stopPropagation(); onInsertTable(table.table_name) }}
                className="flex items-center gap-2 text-sm text-gray-200 hover:text-indigo-400"
              >
                <Table2 size={14} />
                {table.table_name}
              </span>
              <ChevronDown
                size={13}
                className={`text-gray-500 transition-transform ${openTable === table.table_name ? "rotate-180" : ""}`}
              />
            </button>
            {openTable === table.table_name && (
              <div className="pb-2">
                {table.columns.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => onInsertField(col.name)}
                    className="w-full flex items-center justify-between px-4 pl-9 py-1 text-xs
                               text-gray-400 hover:text-white hover:bg-gray-800/50"
                  >
                    <span className="font-mono truncate">{col.name}</span>
                    <span className="text-gray-600">{col.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function QueryPage() {
  const [tables, setTables] = useState([])
  const [sql, setSql] = useState("SELECT * FROM vpc_flow_logs")
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    connectorsApi.getTables().then((data) => setTables(data.items)).catch(console.error)
  }, [])

  const insertAtCursor = (text) => {
    const el = textareaRef.current
    if (!el) {
      setSql((prev) => `${prev} ${text}`)
      return
    }
    const start = el.selectionStart ?? sql.length
    const end = el.selectionEnd ?? sql.length
    const next = `${sql.slice(0, start)}${text}${sql.slice(end)}`
    setSql(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + text.length
    })
  }

  const handleInsertTable = (tableName) => setSql(`SELECT * FROM ${tableName} LIMIT 50`)
  const handleInsertField = (fieldName) => insertAtCursor(fieldName)

  const runQuery = async () => {
    setRunning(true)
    setError(null)
    try {
      const data = await connectorsApi.runQuery(sql, 200)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || "Query failed")
      setResult(null)
    } finally {
      setRunning(false)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      runQuery()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Query</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Read-only SQL по таблицам логов коннекторов — только SELECT, до 1000 строк
        </p>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <textarea
              ref={textareaRef}
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              rows={8}
              className="w-full bg-gray-950 text-gray-100 font-mono text-sm p-4
                         focus:outline-none resize-y"
              placeholder="SELECT * FROM vpc_flow_logs LIMIT 50"
            />
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-800">
              <span className="text-xs text-gray-600">Ctrl/Cmd + Enter — выполнить</span>
              <button
                onClick={runQuery}
                disabled={running}
                className="flex items-center gap-2 text-sm text-white bg-indigo-600
                           hover:bg-indigo-500 disabled:opacity-50 px-4 py-1.5 rounded-lg"
              >
                <Play size={14} />
                {running ? "Running..." : "Run"}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm bg-red-950 border border-red-800
                             text-red-400 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {result && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-800 text-xs text-gray-500">
                {result.row_count} rows
              </div>
              <div className="overflow-auto max-h-[60vh]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {result.columns.map((col) => (
                        <th key={col} className="text-left text-xs text-gray-500 font-medium
                                                   px-4 py-2 uppercase tracking-wider whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {result.rows.length === 0 ? (
                      <tr>
                        <td colSpan={result.columns.length} className="text-center py-8 text-gray-500">
                          No rows
                        </td>
                      </tr>
                    ) : (
                      result.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-800/50">
                          {row.map((value, j) => (
                            <td key={j} className="px-4 py-2 text-gray-300 whitespace-nowrap font-mono text-xs">
                              {value === null ? <span className="text-gray-600">null</span> : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <SchemaSidebar tables={tables} onInsertTable={handleInsertTable} onInsertField={handleInsertField} />
      </div>
    </div>
  )
}
