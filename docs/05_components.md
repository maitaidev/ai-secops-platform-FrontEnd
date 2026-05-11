# Components

## Layout

**File:** `src/components/layout/Layout.jsx`

Main wrapper for all authenticated pages. Provides the sidebar navigation and the top header. Page content renders inside `<Outlet />`.

### Structure

```
<div class="flex h-screen">
  ├── <aside>  Sidebar (w-56, dark bg)
  │   ├── Logo: ShieldAlert icon + "SentinelIQ"
  │   ├── NavLink /dashboard  — "Dashboard"
  │   ├── NavLink /findings   — "Findings"
  │   ├── NavLink /chat       — "AI Chat"
  │   └── Logout button (calls AuthContext.logout())
  └── <main>  Content area (flex-1, scrollable)
      ├── Header: "AI-Powered Security Operations Platform" + "Live" badge
      └── <Outlet />  ← page content renders here
```

### Active NavLink Style

Active route link gets an indigo-600 background pill to indicate current page.

---

## StatCard

**File:** `src/components/ui/StatCard.jsx`

Reusable metric card used on the Dashboard to display a single KPI.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Label shown above the value |
| `value` | string/number | Yes | Main displayed number |
| `color` | string | Yes | Color theme for the icon badge |
| `icon` | ReactNode | Yes | Lucide icon component |
| `subtitle` | string | No | Small text below the value |

### Color Options

`red` / `orange` / `yellow` / `green` / `indigo` / `gray`

### Example Usage

```jsx
<StatCard
  title="Critical"
  value={stats.critical}
  color="red"
  icon={<AlertTriangle size={20} />}
  subtitle="Active threats"
/>
```

---

## SeverityBadge

**File:** `src/components/ui/SeverityBadge.jsx`

Inline colored pill that displays a finding's severity level.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `severity` | string | Yes | Severity level string |

### Severity → Color Mapping

| Severity | Background | Text |
|---|---|---|
| `critical` | red-900 | red-300 |
| `high` | orange-900 | orange-300 |
| `medium` | yellow-900 | yellow-300 |
| `low` | green-900 | green-300 |
| `informational` | gray-800 | gray-300 |

### Example Usage

```jsx
<SeverityBadge severity="critical" />
// Renders: [CRITICAL] badge in red
```

---

## AuthContext

**File:** `src/context/AuthContext.jsx`

React Context that provides global authentication state to the entire application.

### Provided Values

| Value | Type | Description |
|---|---|---|
| `isAuthenticated` | boolean | True if access_token exists in localStorage |
| `login(email, password)` | async function | Calls API, stores tokens, sets isAuthenticated |
| `logout()` | function | Clears localStorage, sets isAuthenticated = false |

### Hook

```jsx
import { useAuth } from '../context/AuthContext'

const { isAuthenticated, login, logout } = useAuth()
```

### Initialization

On mount, checks `localStorage.getItem('access_token')`. If found → `isAuthenticated = true` (restores session after page refresh).

---

## ProtectedRoute

**File:** `src/App.jsx` (inline component)

Wrapper component that guards protected routes. If the user is not authenticated, redirects to `/login`.

### Logic

```jsx
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}
```
