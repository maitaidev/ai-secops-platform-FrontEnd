import api from "./client"

// Все функции для работы с авторизацией

export const authApi = {
  // Логин → возвращает { access_token, refresh_token }
  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),

  // Регистрация → возвращает { access_token, refresh_token }
  register: (email, password) =>
    api.post("/auth/register", { email, password }).then((r) => r.data),

  // Логаут — чистим localStorage
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  },
}
