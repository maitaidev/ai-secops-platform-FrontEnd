# API Reference

## Base Configuration

- **Base URL**: `/api/v1` (proxied to `http://localhost:8000` in development)
- **Auth**: JWT Bearer token — sent automatically via Axios request interceptor
- **Timeout**: 15 000 ms
- **Token storage**: `localStorage` (`access_token`, `refresh_token`)

---

## Authentication Endpoints

### POST `/auth/login`

Authenticate a user and receive JWT tokens.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

**Used in:** `src/api/auth.js` → `authApi.login()`

---

### POST `/auth/register`

Register a new user.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Used in:** `src/api/auth.js` → `authApi.register()`

---

## Findings Endpoints

### GET `/findings`

Retrieve a paginated, filtered list of security findings.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Filter by title (full-text) |
| `severity` | string | `critical` / `high` / `medium` / `low` |
| `status` | string | `open` / `in_review` / `resolved` / `false_positive` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:**
```json
{
  "items": [ { ...finding } ],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

---

### GET `/findings/{id}`

Get a single finding by ID.

---

### POST `/findings`

Create a finding manually.

---

### PUT `/findings/{id}/status`

Update the status of a finding.

**Request body:**
```json
{ "status": "resolved" }
```

**Status values:** `open` | `in_review` | `resolved` | `false_positive`

---

### DELETE `/findings/{id}`

Delete a finding by ID.

---

## Stats Endpoints

### GET `/stats/summary`

Returns aggregated counts for the dashboard metric cards.

**Response:**
```json
{
  "critical": 12,
  "high": 34,
  "open": 89,
  "resolved": 201
}
```

---

### GET `/stats/trends`

Returns 7-day trend data grouped by severity and date.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `days` | number | Number of days to look back (default: 7) |

**Response:** Array of data points used by Recharts `<LineChart>`:
```json
[
  { "date": "05-01", "critical": 3, "high": 8, "medium": 15 },
  { "date": "05-02", "critical": 5, "high": 10, "medium": 12 }
]
```

---

## AI Endpoints

### POST `/ai/analyze`

Run AI analysis on a specific finding.

**Request body:**
```json
{ "finding_id": "abc123" }
```

---

### POST `/ai/chat`

Send a message to the AI assistant with conversation context.

**Request body:**
```json
{
  "message": "What are the most critical threats today?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{ "response": "Based on current findings..." }
```

---

### POST `/ai/report`

Generate a security report.

**Request body:**
```json
{
  "report_type": "executive",
  "period_days": 30
}
```

---

### GET `/ai/risk-score/{resourceId}`

Get the AI-computed risk score for a specific resource.

---

## Error Handling

| HTTP Status | Frontend Behavior |
|---|---|
| `401 Unauthorized` | Clear localStorage tokens → redirect to `/login` |
| `4xx / 5xx` | Display error message to user in the relevant component |
| Network timeout (>15s) | Axios timeout error — shown as generic error |
