import { createContext, useContext, useState } from "react"
import { authApi } from "../api/auth"

/*
  AuthContext — глобальный state для авторизации.
  Зачем? Любой компонент в приложении может узнать:
  - залогинен ли пользователь
  - вызвать login/logout

  Без Context пришлось бы передавать эти данные через props
  через 5-6 уровней компонентов (prop drilling) — это неудобно.
*/

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Проверяем — есть ли токен в localStorage (пользователь уже логинился раньше)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("access_token")
  )

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    // Сохраняем токены
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("refresh_token", data.refresh_token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    authApi.logout()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Хук для удобного использования в компонентах:
// const { isAuthenticated, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext)
