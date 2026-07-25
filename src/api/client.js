import axios from "axios"

/*
  API клиент — один экземпляр для всего приложения.
  Автоматически:
  - добавляет JWT токен к каждому запросу
  - обрабатывает 401 (истёкший токен) — разлогинивает
*/

const api = axios.create({
  baseURL: "/api/v1",   // vite.config.js проксирует на localhost:8000
  timeout: 15000,
})

// ── REQUEST interceptor — добавляем JWT ────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── АВТО-ОБНОВЛЕНИЕ ТОКЕНА ──────────────────────────────
// access_token живёт 30 минут — раньше это было не критично, т.к. ни один
// роутер не проверял токен по-настоящему. С появлением /account/* (2FA) это
// первый реально защищённый эндпоинт, поэтому протухший access_token больше
// не должен тихо выкидывать пользователя на /login — сначала пробуем refresh.
let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) throw new Error("No refresh token")

  // Отдельный axios, а не api — чтобы не попасть в этот же interceptor рекурсивно
  const { data } = await axios.post("/api/v1/auth/refresh", { refresh_token: refreshToken })
  localStorage.setItem("access_token", data.access_token)
  localStorage.setItem("refresh_token", data.refresh_token)
  return data.access_token
}

// ── RESPONSE interceptor — обрабатываем ошибки ─────────
api.interceptors.response.use(
  (response) => response,   // успех — просто возвращаем
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original?._retried && localStorage.getItem("refresh_token")) {
      original._retried = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null })
        }
        const newAccessToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return api(original)
      } catch {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(error)
      }
    }

    if (error.response?.status === 401) {
      // Refresh уже не помог (или его не было) → чистим storage → редирект на логин
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)

export default api
