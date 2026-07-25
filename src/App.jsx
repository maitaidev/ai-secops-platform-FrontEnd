import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Layout from "./components/layout/Layout"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import FindingsPage from "./pages/FindingsPage"
import ChatPage from "./pages/ChatPage"
import ConnectorsPage from "./pages/ConnectorsPage"
import ConnectorDetailPage from "./pages/ConnectorDetailPage"
import TablesPage from "./pages/TablesPage"
import QueryPage from "./pages/QueryPage"
import UsersPage from "./pages/UsersPage"
import RulesPage from "./pages/RulesPage"
import SmtpPage from "./pages/SmtpPage"
import SecurityPage from "./pages/SecurityPage"

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
            <Route path="integrations/connectors"       element={<ConnectorsPage />} />
            <Route path="integrations/connectors/:type" element={<ConnectorDetailPage />} />
            <Route path="integrations/tables"           element={<TablesPage />} />
            <Route path="integrations/query"            element={<QueryPage />} />
            <Route path="management/users"               element={<UsersPage />} />
            <Route path="management/rules"               element={<RulesPage />} />
            <Route path="management/smtp"                element={<SmtpPage />} />
            <Route path="management/security"            element={<SecurityPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
