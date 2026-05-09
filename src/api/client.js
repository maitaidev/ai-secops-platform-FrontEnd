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

// ── RESPONSE interceptor — обрабатываем ошибки ─────────
api.interceptors.response.use(
  (response) => response,   // успех — просто возвращаем
  (error) => {
    if (error.response?.status === 401) {
      // Токен истёк → чистим storage → редирект на логин
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api
