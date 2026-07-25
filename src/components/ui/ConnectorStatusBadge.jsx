/*
  ConnectorStatusBadge — цветной бейдж статуса коннектора.

  Пример: <ConnectorStatusBadge status="connected" />  →  CONNECTED
*/

const styles = {
  connected: "bg-green-950 text-green-400 border border-green-800",
  pending:   "bg-gray-800 text-gray-400 border border-gray-700",
  error:     "bg-red-950 text-red-400 border border-red-800",
  disabled:  "bg-gray-800 text-gray-500 border border-gray-700",
}

export default function ConnectorStatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
      {status ? status.toUpperCase() : "NOT CONFIGURED"}
    </span>
  )
}
