import api from "./client"

// Все функции для работы с авторизацией

export const authApi = {
  // Логин → { access_token, refresh_token } либо { requires_totp: true, mfa_token }
  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),

  // Второй шаг логина при включённой 2FA → { access_token, refresh_token }
  loginTotp: (mfa_token, code) =>
    api.post("/auth/login/totp", { mfa_token, code }).then((r) => r.data),

  // Регистрация → возвращает { access_token, refresh_token }
  register: (email, password) =>
    api.post("/auth/register", { email, password }).then((r) => r.data),

  // Логаут — чистим localStorage
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  },
}
