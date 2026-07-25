import { useState, useEffect } from "react"
import { Save, ShieldCheck } from "lucide-react"
import { managementApi } from "../api/management"

/*
  RulesPage — Management → Rules.
  Справочник разрешений по ролям (admin / analytics / billing): описание +
  чекбоксы доступа по разделам платформы. Редактируется и хранится в БД.
*/

const SECTION_LABELS = {
  dashboard: "Dashboard",
  findings: "Findings",
  ai_chat: "AI Chat",
  connectors: "Connectors",
  tables: "Tables",
  query: "Query",
  management: "Management",
}

function RuleCard({ rule, onSave }) {
  const [description, setDescription] = useState(rule.description || "")
  const [permissions, setPermissions] = useState(rule.permissions || {})
  const [saving, setSaving] = useState(false)

  const togglePermission = (key) =>
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(rule.role, { description, permissions })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg border text-indigo-400 bg-indigo-950 border-indigo-900">
          <ShieldCheck size={16} />
        </div>
        <h3 className="text-white font-medium uppercase tracking-wide">{rule.role}</h3>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg
                   px-3 py-2 text-sm text-white placeholder-gray-600
                   focus:outline-none focus:border-indigo-500 resize-none"
        placeholder="Описание роли..."
      />

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(SECTION_LABELS).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-2 text-sm text-gray-300 px-2 py-1.5
                       rounded-lg hover:bg-gray-800/50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!!permissions[key]}
              onChange={() => togglePermission(key)}
              className="accent-indigo-600"
            />
            {label}
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 text-sm text-white bg-indigo-600
                   hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg"
      >
        <Save size={14} />
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  )
}

export default function RulesPage() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      const data = await managementApi.getRules()
      setRules(data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRule = async (role, body) => {
    try {
      const updated = await managementApi.updateRule(role, body)
      setRules((prev) => prev.map((r) => (r.role === role ? updated : r)))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Rules</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Разрешения по ролям — ADMIN, Analytics, Billing
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-10 text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <RuleCard key={rule.role} rule={rule} onSave={handleSaveRule} />
          ))}
        </div>
      )}
    </div>
  )
}
