import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { RefreshCw, Network, ShieldBan, ScrollText, Activity } from "lucide-react"
import ConnectorStatusBadge from "../components/ui/ConnectorStatusBadge"
import { connectorsApi } from "../api/connectors"

/*
  ConnectorsPage — галерея встроенных AWS-коннекторов (Integrations & Data).
  Аналог "Data connectors" в Microsoft Sentinel: карточка на тип коннектора,
  клик → страница конфигурации + логов этого коннектора.
*/

const CONNECTOR_TYPES = [
  { type: "aws_vpc_flow_logs", label: "VPC Flow Logs", description: "Сетевой трафик из ваших VPC", icon: Network },
  { type: "aws_waf",           label: "AWS WAF",        description: "Логи запросов Web ACL",         icon: ShieldBan },
  { type: "aws_cloudtrail",    label: "AWS CloudTrail",  description: "Логи API-активности аккаунта",  icon: ScrollText },
  { type: "aws_cloudwatch",    label: "AWS CloudWatch",  description: "События log group / log stream", icon: Activity },
]

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadConnectors()
  }, [])

  const loadConnectors = async () => {
    setLoading(true)
    try {
      const data = await connectorsApi.getAll()
      setConnectors(data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const connectorByType = (type) => connectors.find((c) => c.connector_type === type)

  return (
    <div className="space-y-4">

      {/* ── ЗАГОЛОВОК ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Connectors</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Встроенные AWS-коннекторы — подключение через IAM Role + S3 + SQS
          </p>
        </div>
        <button
          onClick={loadConnectors}
          className="flex items-center gap-2 text-sm text-gray-400
                     hover:text-white px-3 py-1.5 bg-gray-800 rounded-lg"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── ГАЛЕРЕЯ ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONNECTOR_TYPES.map(({ type, label, description, icon: Icon }) => {
          const connector = connectorByType(type)
          return (
            <button
              key={type}
              onClick={() => navigate(`/integrations/connectors/${type}`)}
              className="text-left bg-gray-900 border border-gray-800 rounded-xl p-5
                         hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg border text-indigo-400 bg-indigo-950 border-indigo-900">
                  <Icon size={18} />
                </div>
                <ConnectorStatusBadge status={connector?.status} />
              </div>
              <p className="text-white font-medium">{label}</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
              {connector?.last_sync_at && (
                <p className="text-xs text-gray-600 mt-3">
                  Last sync: {new Date(connector.last_sync_at).toLocaleString()}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
