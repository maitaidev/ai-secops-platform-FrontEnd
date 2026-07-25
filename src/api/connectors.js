import api from "./client"

export const connectorsApi = {
  // Список коннекторов (опционально ?connector_type=)
  getAll: (params = {}) =>
    api.get("/connectors", { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/connectors/${id}`).then((r) => r.data),

  create: (body) =>
    api.post("/connectors", body).then((r) => r.data),

  update: (id, body) =>
    api.put(`/connectors/${id}`, body).then((r) => r.data),

  remove: (id) =>
    api.delete(`/connectors/${id}`),

  testConnection: (id) =>
    api.post(`/connectors/${id}/test-connection`).then((r) => r.data),

  sync: (id) =>
    api.post(`/connectors/${id}/sync`).then((r) => r.data),

  getLogs: (id, params = {}) =>
    api.get(`/connectors/${id}/logs`, { params }).then((r) => r.data),

  // Схема всех лог-таблиц (модуль Tables) + количество строк
  getTables: () =>
    api.get("/connectors/tables").then((r) => r.data),

  // Безопасный read-only SQL по лог-таблицам (модуль Query)
  runQuery: (sql, limit) =>
    api.post("/connectors/query", { sql, limit }).then((r) => r.data),
}
