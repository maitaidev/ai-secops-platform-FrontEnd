import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { managementApi } from "../api/management"

/*
  UsersPage — Management → Users.
  Список пользователей платформы с возможностью сменить роль и активность.
*/

const ROLE_OPTIONS = ["admin", "analytics", "billing"]

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await managementApi.getUsers()
      setUsers(data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      const updated = await managementApi.updateUserRole(userId, role)
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      const updated = await managementApi.updateUserStatus(user.id, !user.is_active)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} users total</p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 text-sm text-gray-400
                     hover:text-white px-3 py-1.5 bg-gray-800 rounded-lg"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Email</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Role</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Status</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">2FA</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  <RefreshCw className="animate-spin inline mr-2" size={16} />
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3 text-white">{user.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-xs text-gray-300
                                 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 uppercase"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r.toUpperCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-colors ${
                        user.is_active
                          ? "bg-green-950 text-green-400 border-green-800 hover:bg-green-900"
                          : "bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700"
                      }`}
                    >
                      {user.is_active ? "ACTIVE" : "DISABLED"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      user.totp_enabled
                        ? "bg-indigo-950 text-indigo-400 border-indigo-800"
                        : "bg-gray-800 text-gray-500 border-gray-700"
                    }`}>
                      {user.totp_enabled ? "ON" : "OFF"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
