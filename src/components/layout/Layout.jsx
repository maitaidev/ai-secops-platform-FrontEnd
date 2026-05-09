import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Shield,
  MessageSquare,
  LogOut,
  ShieldAlert,
} from "lucide-react"

/*
  Layout — общая обёртка для всех защищённых страниц.
  Sidebar слева + контент справа.
  <Outlet /> — здесь рендерится текущая страница (Dashboard / Findings / Chat).
*/

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/findings",  icon: Shield,          label: "Findings" },
  { to: "/chat",      icon: MessageSquare,   label: "AI Chat" },
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      {/* ── SIDEBAR ──────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">

        {/* Логотип */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
          <ShieldAlert className="text-indigo-400" size={22} />
          <span className="font-semibold text-white text-sm tracking-wide">
            SentinelIQ
          </span>
        </div>

        {/* Навигация */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Логаут */}
        <div className="px-2 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg
                       text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400
                       transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800
                           px-6 py-3 flex items-center justify-between">
          <h1 className="text-sm text-gray-400">
            AI-Powered Security Operations Platform
          </h1>
          <span className="text-xs text-indigo-400 bg-indigo-950 px-2 py-1 rounded-full">
            Live
          </span>
        </header>

        {/* Текущая страница */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

    </div>
  )
}
