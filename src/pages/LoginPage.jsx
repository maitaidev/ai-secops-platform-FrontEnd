import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { ShieldAlert, Loader2 } from "lucide-react"
import NeuralGridBackground from "../components/ui/NeuralGridBackground"

/*
  LoginPage — страница входа.

  Что происходит при логине:
  1. Пользователь вводит email + пароль
  2. useState хранит значения полей
  3. При сабмите — вызываем login() из AuthContext
  4. AuthContext делает POST /auth/login → сохраняет JWT
  5. navigate("/dashboard") — переходим на дашборд
*/

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // State для полей формы
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()       // не перезагружать страницу
    setLoading(true)
    setError("")

    try {
      await login(email, password)
      navigate("/dashboard")   // успех → дашборд
    } catch (err) {
      // FastAPI возвращает { detail: "Неверный email или пароль" }
      setError(err.response?.data?.detail || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-950 flex items-center justify-center px-4 overflow-hidden">
      <NeuralGridBackground />
      {/* виньетка — затемняет края и добавляет глубину */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.6)_75%)] pointer-events-none" />

      {/* контур щита для clip-path карточки */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="shieldClip" clipPathUnits="objectBoundingBox">
            <path d="M0.02,0.10 C0.02,0.04 0.06,0.02 0.12,0.02 L0.88,0.02 C0.94,0.02 0.98,0.04 0.98,0.10 L0.98,0.72 C0.98,0.90 0.82,0.96 0.5,1.0 C0.18,0.96 0.02,0.90 0.02,0.72 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* карточка в форме щита */}
      <div
        className="relative z-10 w-full max-w-sm border border-indigo-500/25
                    bg-gray-950/75 backdrop-blur-sm shadow-2xl"
        style={{ clipPath: "url(#shieldClip)" }}
      >
        <div className="px-8 pt-12 pb-24">

          {/* Логотип */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14
                            bg-indigo-600 rounded-2xl mb-4">
              <ShieldAlert className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-semibold text-white">SentinelIQ</h1>
            <p className="text-sm text-gray-500 mt-1">Security Operations Platform</p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg
                           px-3 py-2.5 text-sm text-white placeholder-gray-600
                           focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg
                           px-3 py-2.5 text-sm text-white placeholder-gray-600
                           focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Ошибка */}
            {error && (
              <p className="text-sm text-red-400 bg-red-950 border border-red-900
                            px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                         text-white font-medium py-2.5 rounded-lg text-sm
                         transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
