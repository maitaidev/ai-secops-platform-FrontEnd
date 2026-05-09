import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Layout from "./components/layout/Layout"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import FindingsPage from "./pages/FindingsPage"
import ChatPage from "./pages/ChatPage"

/*
  ProtectedRoute — защищённый роут.
  Если не залогинен → редирект на /login.
  Аналогия: как middleware в FastAPI который проверяет JWT.
*/
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Публичный роут */}
          <Route path="/login" element={<LoginPage />} />

          {/* Защищённые роуты — нужна авторизация */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Дочерние роуты рендерятся внутри Layout */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="findings"  element={<FindingsPage />} />
            <Route path="chat"      element={<ChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
