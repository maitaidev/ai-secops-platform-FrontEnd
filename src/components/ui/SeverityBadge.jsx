/*
  SeverityBadge — цветной бейдж severity.
  Используется в таблице findings.

  Пример: <SeverityBadge severity="critical" />  →  🔴 CRITICAL
*/

const styles = {
  critical:      "bg-red-950 text-red-400 border border-red-800",
  high:          "bg-orange-950 text-orange-400 border border-orange-800",
  medium:        "bg-yellow-950 text-yellow-400 border border-yellow-800",
  low:           "bg-green-950 text-green-400 border border-green-800",
  informational: "bg-gray-800 text-gray-400 border border-gray-700",
}

export default function SeverityBadge({ severity }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${styles[severity] || styles.informational}`}>
      {severity?.toUpperCase()}
    </span>
  )
}
