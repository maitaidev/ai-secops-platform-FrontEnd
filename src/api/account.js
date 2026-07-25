import api from "./client"

export const accountApi = {
  getMe: () =>
    api.get("/account/me").then((r) => r.data),

  getTotpStatus: () =>
    api.get("/account/totp/status").then((r) => r.data),

  setupTotp: () =>
    api.post("/account/totp/setup").then((r) => r.data),

  confirmTotp: (secret, code) =>
    api.post("/account/totp/confirm", { secret, code }).then((r) => r.data),

  disableTotp: (code) =>
    api.post("/account/totp/disable", { code }).then((r) => r.data),
}
