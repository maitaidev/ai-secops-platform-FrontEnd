# Architecture

## Component Hierarchy

```
App
├── BrowserRouter
├── AuthProvider  (React Context — global auth state)
└── Routes
    ├── /login  →  LoginPage  (public)
    └── /  (ProtectedRoute — redirects to /login if not authenticated)
        └── Layout
            ├── Sidebar
            │   ├── Logo (SentinelIQ + ShieldAlert icon)
            │   ├── NavLink → /dashboard
            │   ├── NavLink → /findings
            │   ├── NavLink → /chat
            │   └── Logout button
            ├── Header ("AI-Powered Security Operations Platform" + "Live" badge)
            └── <Outlet>  (page content rendered here)
                ├── /dashboard  →  DashboardPage
                ├── /findings   →  FindingsPage
                └── /chat       →  ChatPage
```

---

## Route Table

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/login` | LoginPage | No | Email/password login form |
| `/` | redirect | Yes | Redirects to `/dashboard` |
| `/dashboard` | DashboardPage | Yes | Metrics, chart, recent findings |
| `/findings` | FindingsPage | Yes | Full findings table |
| `/chat` | ChatPage | Yes | AI chat interface |

---

## Authentication Flow

```
1. User opens any protected route
      ↓
2. ProtectedRoute checks isAuthenticated (from AuthContext)
      ↓
3a. NOT authenticated → redirect to /login
3b. Authenticated → render page
      ↓
4. LoginPage: user submits email + password
      ↓
5. authApi.login() → POST /api/v1/auth/login
      ↓
6. Backend returns { access_token, refresh_token }
      ↓
7. AuthContext stores tokens in localStorage
      ↓
8. isAuthenticated = true → redirect to /dashboard
      ↓
9. Every API request: Axios interceptor adds
   Authorization: Bearer {access_token} header
      ↓
10. On 401 response → clear localStorage → redirect /login
```

---

## State Management

The app uses **React Context** for global state (no Redux/Zustand). Local component state uses `useState` hooks.

| State | Location | Type |
|---|---|---|
| isAuthenticated | AuthContext | Global (Context) |
| access_token / refresh_token | localStorage | Persisted |
| Dashboard stats, trends, findings | DashboardPage | Local useState |
| Findings list, filters, pagination | FindingsPage | Local useState |
| Chat messages, input | ChatPage | Local useState |

---

## Data Flow — Dashboard Page

```
DashboardPage mounts
        ↓
Promise.all([
  findingsApi.getStats(),        → GET /api/v1/stats/summary
  findingsApi.getTrends(7),      → GET /api/v1/stats/trends
  findingsApi.getAll({limit:5})  → GET /api/v1/findings
])
        ↓
setStats(data)  →  renders 4 StatCards
setTrends(data) →  renders Recharts LineChart (7 days)
setFindings(data) → renders recent findings table (5 rows)
```

---

## Data Flow — Findings Page

```
FindingsPage mounts / filter changes
        ↓
findingsApi.getAll({
  search, severity, status, page, limit: 20
})                → GET /api/v1/findings
        ↓
setFindings(data.items)
setTotal(data.total)
        ↓
Table renders with:
  - SeverityBadge per row
  - Status dropdown per row (onChange → PUT /api/v1/findings/{id}/status)
  - Pagination controls (prev/next)
```

---

## Data Flow — Chat Page

```
User types message → presses Enter
        ↓
messages.push({ role: 'user', content: input })
        ↓
aiApi.chat(message, conversationHistory)
                      → POST /api/v1/ai/chat
                        body: { message, history: [...] }
        ↓
messages.push({ role: 'assistant', content: response })
        ↓
useEffect on messages → scroll to bottom (useRef)
```
