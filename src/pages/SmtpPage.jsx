import { useState, useEffect } from "react"
import { Save, Send, Mail } from "lucide-react"
import { managementApi } from "../api/management"

/*
  SmtpPage — Management → SMTP.
  Настройки исходящей почты для уведомлений + отправка тестового письма.
*/

const EMPTY_FORM = { host: "", port: 587, username: "", password: "", from_email: "", use_tls: true }

export default function SmtpPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [passwordSet, setPasswordSet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testTo, setTestTo] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await managementApi.getSmtp()
      setForm({
        host: data.host || "",
        port: data.port || 587,
        username: data.username || "",
        password: "",
        from_email: data.from_email || "",
        use_tls: data.use_tls,
      })
      setPasswordSet(data.password_set)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = await managementApi.updateSmtp({ ...form, port: Number(form.port) || 587 })
      setPasswordSet(data.password_set)
      setForm((prev) => ({ ...prev, password: "" }))
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testTo) return
    setTesting(true)
    setTestResult(null)
    try {
      const result = await managementApi.testSmtp(testTo)
      setTestResult(result)
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.detail || "Test failed" })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500 py-10 text-center">Loading...</p>
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-white">SMTP</h2>
        <p className="text-sm text-gray-500 mt-0.5">Настройки отправки email-уведомлений</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Host</label>
          <input
            value={form.host}
            onChange={(e) => handleChange("host", e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                       placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Port</label>
          <input
            type="number"
            value={form.port}
            onChange={(e) => handleChange("port", e.target.value)}
            placeholder="587"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                       placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Username</label>
          <input
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="user@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                       placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
            Password {passwordSet && <span className="text-gray-600 normal-case">(сохранён — оставьте пустым, чтобы не менять)</span>}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder={passwordSet ? "••••••••" : ""}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                       placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">From email</label>
          <input
            value={form.from_email}
            onChange={(e) => handleChange("from_email", e.target.value)}
            placeholder="noreply@sentineliq.io"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                       placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.use_tls}
            onChange={(e) => handleChange("use_tls", e.target.checked)}
            className="accent-indigo-600"
          />
          Use TLS
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 text-sm text-white bg-indigo-600
                   hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg"
      >
        <Save size={14} />
        {saving ? "Saving..." : "Save settings"}
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Mail size={14} />
          Send test email
        </h3>
        <div className="flex gap-2">
          <input
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                       placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleTest}
            disabled={testing || !testTo}
            className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800
                       hover:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded-lg"
          >
            <Send size={14} />
            {testing ? "Sending..." : "Send"}
          </button>
        </div>
        {testResult && (
          <div className={`text-sm rounded-lg px-4 py-3 border ${
            testResult.success
              ? "bg-green-950 border-green-800 text-green-400"
              : "bg-red-950 border-red-800 text-red-400"
          }`}>
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  )
}
