import { useState, useEffect } from "react"
import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react"
import { accountApi } from "../api/account"

/*
  SecurityPage — self-service 2FA (TOTP) для текущего пользователя.
  Каждый пользователь сам решает, включать ли 2FA — не связано с Management/Users,
  где админ управляет ролями/статусами ДРУГИХ пользователей.
*/

export default function SecurityPage() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState(null)   // { secret, otpauth_uri, qr_code_base64 }
  const [confirmCode, setConfirmCode] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const data = await accountApi.getTotpStatus()
      setEnabled(data.enabled)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startSetup = async () => {
    setError("")
    try {
      const data = await accountApi.setupTotp()
      setSetup(data)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start setup")
    }
  }

  const cancelSetup = () => {
    setSetup(null)
    setConfirmCode("")
    setError("")
  }

  const confirmSetup = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await accountApi.confirmTotp(setup.secret, confirmCode)
      setEnabled(true)
      setSetup(null)
      setConfirmCode("")
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid code")
    } finally {
      setBusy(false)
    }
  }

  const disable = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await accountApi.disableTotp(disableCode)
      setEnabled(false)
      setDisableCode("")
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid code")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500 py-10 text-center">Loading...</p>
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h2 className="text-xl font-semibold text-white">Security</h2>
        <p className="text-sm text-gray-500 mt-0.5">Двухфакторная аутентификация (2FA)</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${
            enabled
              ? "text-green-400 bg-green-950 border-green-900"
              : "text-gray-400 bg-gray-800 border-gray-700"
          }`}>
            {enabled ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
          </div>
          <div>
            <p className="text-white font-medium">
              {enabled ? "2FA включена" : "2FA выключена"}
            </p>
            <p className="text-xs text-gray-500">
              Authenticator-приложение (Google Authenticator, Authy и т.п.)
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm bg-red-950 border border-red-800 text-red-400 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* ── Уже включена: форма отключения ─────────── */}
        {enabled && !setup && (
          <form onSubmit={disable} className="space-y-3">
            <p className="text-sm text-gray-400">
              Чтобы отключить 2FA, введите текущий код из приложения.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                           placeholder-gray-600 tracking-widest text-center focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={busy || disableCode.length !== 6}
                className="text-sm text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 px-4 py-2 rounded-lg"
              >
                {busy ? "..." : "Disable 2FA"}
              </button>
            </div>
          </form>
        )}

        {/* ── Не включена, ещё не начали настройку ────── */}
        {!enabled && !setup && (
          <button
            onClick={startSetup}
            className="flex items-center gap-2 text-sm text-white bg-indigo-600
                       hover:bg-indigo-500 px-4 py-2 rounded-lg"
          >
            <KeyRound size={14} />
            Enable 2FA
          </button>
        )}

        {/* ── Настройка в процессе: QR + подтверждение ── */}
        {setup && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <img
                src={`data:image/png;base64,${setup.qr_code_base64}`}
                alt="TOTP QR code"
                className="rounded-lg border border-gray-700 bg-white p-2"
                width={180}
                height={180}
              />
              <p className="text-xs text-gray-500 text-center">
                Отсканируйте QR в authenticator-приложении, или введите секрет вручную:
              </p>
              <code className="text-xs text-gray-300 bg-gray-950 border border-gray-800 rounded px-2 py-1 break-all">
                {setup.secret}
              </code>
            </div>

            <form onSubmit={confirmSetup} className="space-y-3">
              <label className="block text-xs text-gray-500 uppercase tracking-wider">
                Код из приложения
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  autoFocus
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                             placeholder-gray-600 tracking-widest text-center focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={busy || confirmCode.length !== 6}
                  className="text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg"
                >
                  {busy ? "..." : "Confirm"}
                </button>
              </div>
              <button
                type="button"
                onClick={cancelSetup}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
