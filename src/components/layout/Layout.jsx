import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Shield,
  MessageSquare,
  LogOut,
  Plug,
  Cable,
  Table2,
  TerminalSquare,
  Settings,
  Users,
  ShieldCheck,
  Mail,
  KeyRound,
  ChevronDown,
} from "lucide-react"
import { GiHawkEmblem } from "react-icons/gi"

/*
  Layout — общая обёртка для всех защищённых страниц.
  Sidebar слева + контент справа.
  <Outlet /> — здесь рендерится текущая страница (Dashboard / Findings / Chat / Connectors).
*/

// Секции без label рендерятся плоско (как раньше); секции с label — сворачиваемые группы
const navSections = [
  {
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/findings",  icon: Shield,          label: "Findings" },
      { to: "/chat",      icon: MessageSquare,   label: "AI Chat" },
    ],
  },
  {
    label: "Integrations & Data",
    icon: Plug,
    items: [
      { to: "/integrations/connectors", icon: Cable,          label: "Connectors" },
      { to: "/integrations/tables",     icon: Table2,         label: "Tables" },
      { to: "/integrations/query",      icon: TerminalSquare, label: "Query" },
    ],
  },
  {
    label: "Management",
    icon: Settings,
    items: [
      { to: "/management/users",    icon: Users,       label: "Users" },
      { to: "/management/rules",    icon: ShieldCheck, label: "Rules" },
      { to: "/management/smtp",     icon: Mail,        label: "SMTP" },
      { to: "/management/security", icon: KeyRound,    label: "Security" },
    ],
  },
]

function NavGroup({ section }) {
  const [open, setOpen] = useState(false)

  if (!section.label) {
    return (
      <>
        {section.items.map(({ to, icon: Icon, label }) => (
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
      </>
    )
  }

  const SectionIcon = section.icon

  return (
    <div className="mt-3 pt-3 border-t border-gray-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 pb-2 text-xs font-semibold
                   text-indigo-300 uppercase tracking-wider hover:text-indigo-200
                   transition-colors"
      >
        {SectionIcon && <SectionIcon size={13} className="text-indigo-400" />}
        <span className="flex-1 text-left">{section.label}</span>
        <ChevronDown
          size={13}
          className={`text-indigo-400 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && section.items.map(({ to, icon: Icon, label }) => (
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
    </div>
  )
}

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
          <GiHawkEmblem className="text-indigo-400" size={22} />
          <span className="font-semibold text-white text-sm tracking-wide">
            corvix.io
          </span>
        </div>

        {/* Навигация */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navSections.map((section, i) => (
            <NavGroup key={section.label || i} section={section} />
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
