# SentinelIQ — AI Security Platform: Overview

## What is SentinelIQ?

SentinelIQ is an AI-powered Security Operations platform (SecOps). The frontend is a single-page application (SPA) built with React 18 that provides security analysts with:

- A **dashboard** with real-time security metrics and trend charts
- A **findings management** table with filters, search, and status updates
- An **AI chat** interface for querying the AI security assistant

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 18.3.1 |
| Routing | React Router DOM | 6.23.1 |
| HTTP Client | Axios | 1.7.2 |
| Charts | Recharts | 2.12.7 |
| Icons | Lucide React | 0.383.0 |
| Styling | Tailwind CSS | 3.4.4 |
| Build Tool | Vite | 5.2.11 |
| PostCSS | Autoprefixer | 10.4.19 |

---

## Project Structure

```
ai-secops-platform-FrontEnd/
├── index.html                  # HTML entry point (React root)
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite config (dev server + API proxy)
├── tailwind.config.js          # Tailwind theme (brand colors)
├── postcss.config.js           # PostCSS plugins
└── src/
    ├── main.jsx                # React DOM mount
    ├── App.jsx                 # Router + protected routes
    ├── index.css               # Global styles + Tailwind directives
    ├── api/
    │   ├── client.js           # Axios instance + JWT interceptors
    │   ├── auth.js             # Login / register / logout
    │   ├── findings.js         # CRUD for findings + stats
    │   └── ai.js               # AI analyze / chat / report / risk-score
    ├── context/
    │   └── AuthContext.jsx     # Global auth state (React Context)
    ├── components/
    │   ├── layout/
    │   │   └── Layout.jsx      # Sidebar + header wrapper
    │   └── ui/
    │       ├── StatCard.jsx    # Dashboard metric card
    │       └── SeverityBadge.jsx  # Colored severity pill
    └── pages/
        ├── LoginPage.jsx       # Public login screen
        ├── DashboardPage.jsx   # Metrics, trend chart, recent findings
        ├── FindingsPage.jsx    # Full findings table with filters
        └── ChatPage.jsx        # AI chat interface
```

---

## Design System

- **Theme**: Dark (gray-950 background, gray-100 text)
- **Accent color**: Indigo (#6366f1)
- **Severity colors**:
  - Critical → Red
  - High → Orange
  - Medium → Yellow
  - Low → Green
  - Informational → Gray
- **Responsive**: Mobile-first grid layouts
- **Scrollbar**: Custom thin dark scrollbar (webkit)

---

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Backend must be running at `http://localhost:8000` — all `/api/*` requests are proxied there by Vite.
