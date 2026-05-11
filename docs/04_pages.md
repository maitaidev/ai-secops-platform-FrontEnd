# Pages

## LoginPage

**File:** `src/pages/LoginPage.jsx`
**Route:** `/login`
**Auth required:** No

### Description

A public login form. On successful authentication redirects the user to `/dashboard`.

### UI Elements

- Email input field
- Password input field
- Submit button (shows spinner while loading)
- Error message display (from backend `detail` field)

### State

| State var | Type | Description |
|---|---|---|
| `email` | string | Controlled input |
| `password` | string | Controlled input |
| `loading` | boolean | True while waiting for API response |
| `error` | string | Error message to display |

### Logic

1. On submit → calls `login(email, password)` from `AuthContext`
2. `AuthContext.login()` calls `authApi.login()` → stores tokens → sets `isAuthenticated = true`
3. On success → `navigate('/dashboard')`
4. On error → sets `error` state from `err.response.data.detail`

---

## DashboardPage

**File:** `src/pages/DashboardPage.jsx`
**Route:** `/dashboard`
**Auth required:** Yes

### Description

Main security operations dashboard. Shows aggregated metrics, a 7-day trend chart, and the 5 most recent findings.

### Sections

#### 1. Stat Cards (4 cards in a grid)

| Card | Color | Metric |
|---|---|---|
| Critical | Red | Count of critical severity findings |
| High | Orange | Count of high severity findings |
| Open | Indigo | Total open findings |
| Resolved | Green | Total resolved findings |

Uses `<StatCard />` component.

#### 2. Trend Chart

- **Type**: Recharts `<LineChart>`
- **X-axis**: Date (MM-DD format)
- **Y-axis**: Finding count
- **Lines**: Critical (red), High (orange), Medium (yellow)
- **Data source**: `findingsApi.getTrends(7)` — last 7 days

#### 3. Recent Findings Table

- Last 5 findings
- Columns: Severity badge, Title, Resource ID, Source
- "View all" link → `/findings`

### Data Loading

All three data sources are fetched in parallel on mount using `Promise.all()`. A refresh button re-triggers the fetch.

```jsx
Promise.all([
  findingsApi.getStats(),
  findingsApi.getTrends(7),
  findingsApi.getAll({ limit: 5 })
])
```

---

## FindingsPage

**File:** `src/pages/FindingsPage.jsx`
**Route:** `/findings`
**Auth required:** Yes

### Description

Full paginated table of all security findings with filtering and inline status management.

### Filters

| Filter | Type | Options |
|---|---|---|
| Search | Text input | Free-text search by title (400ms debounce) |
| Severity | Dropdown | All / Critical / High / Medium / Low |
| Status | Dropdown | All / Open / In Review / Resolved / False Positive |

Changing any filter resets pagination to page 1.

### Table Columns

| Column | Description |
|---|---|
| Severity | `<SeverityBadge />` component |
| Title | Finding title |
| Source | Source system identifier |
| Resource ID | Affected resource |
| Status | Dropdown for inline status change |

### Pagination

- 20 items per page
- Shows: "Showing X–Y of Z findings"
- Previous / Next buttons
- Disabled when no previous/next page available

### Inline Status Update

Each row has a `<select>` dropdown. On change:
```
findingsApi.updateStatus(id, newStatus) → PUT /api/v1/findings/{id}/status
```
The table re-fetches after a successful update.

---

## ChatPage

**File:** `src/pages/ChatPage.jsx`
**Route:** `/chat`
**Auth required:** Yes

### Description

Conversational AI interface. Users can ask security-related questions and receive context-aware responses from the AI backend. Full conversation history is sent with each message.

### UI Layout

- **Message area**: Scrollable, auto-scrolls to bottom on new messages
- **User messages**: Right-aligned, indigo-600 background
- **Assistant messages**: Left-aligned, gray-800 background
- **Input area**: Textarea at the bottom + Send button

### Initial Suggestions

When the chat is empty, 4 suggested prompts are shown (in Russian):
1. Покажи мне критические уязвимости за сегодня
2. Проанализируй топ угрозы этой недели
3. Какие ресурсы наиболее уязвимы?
4. Создай отчёт по инцидентам за последние 7 дней

Clicking a suggestion fills the input field.

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Send message |
| `Shift + Enter` | New line in input |

### Message State

```js
messages: [
  { role: 'user', content: 'text' },
  { role: 'assistant', content: 'text' },
  ...
]
```

### Error Handling

On API error, a message is appended to the conversation:
> "Извините, произошла ошибка. Попробуйте ещё раз."
