import api from "./client"

export const findingsApi = {
  // Список с фильтрами
  getAll: (params = {}) =>
    api.get("/findings", { params }).then((r) => r.data),

  // Один finding
  getById: (id) =>
    api.get(`/findings/${id}`).then((r) => r.data),

  // Создать вручную
  create: (body) =>
    api.post("/findings", body).then((r) => r.data),

  // Изменить статус
  updateStatus: (id, status) =>
    api.put(`/findings/${id}/status`, { status }).then((r) => r.data),

  // Удалить
  delete: (id) =>
    api.delete(`/findings/${id}`),

  // Статистика для дашборда
  getStats: () =>
    api.get("/stats/summary").then((r) => r.data),

  // Тренды для графика
  getTrends: (days = 7) =>
    api.get("/stats/trends", { params: { days } }).then((r) => r.data),
}
