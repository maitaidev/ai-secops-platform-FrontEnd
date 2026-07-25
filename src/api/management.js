import api from "./client"

export const managementApi = {
  // Users
  getUsers: () =>
    api.get("/management/users").then((r) => r.data),
  updateUserRole: (userId, role) =>
    api.put(`/management/users/${userId}/role`, { role }).then((r) => r.data),
  updateUserStatus: (userId, is_active) =>
    api.put(`/management/users/${userId}/status`, { is_active }).then((r) => r.data),

  // Rules
  getRules: () =>
    api.get("/management/rules").then((r) => r.data),
  updateRule: (role, body) =>
    api.put(`/management/rules/${role}`, body).then((r) => r.data),

  // SMTP
  getSmtp: () =>
    api.get("/management/smtp").then((r) => r.data),
  updateSmtp: (body) =>
    api.put("/management/smtp", body).then((r) => r.data),
  testSmtp: (to) =>
    api.post("/management/smtp/test", { to }).then((r) => r.data),
}
