import api from "./client"

export const aiApi = {
  // Анализ одного finding
  analyze: (findingId) =>
    api.post("/ai/analyze", { finding_id: findingId }).then((r) => r.data),

  // Чат с AI
  chat: (message, history = []) =>
    api.post("/ai/chat", { message, history }).then((r) => r.data),

  // Генерация отчёта
  generateReport: (reportType, periodDays = 7) =>
    api.post("/ai/report", {
      report_type: reportType,
      period_days: periodDays,
    }).then((r) => r.data),

  // Risk Score ресурса
  getRiskScore: (resourceId) =>
    api.get(`/ai/risk-score/${resourceId}`).then((r) => r.data),
}
