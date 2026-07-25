import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import ConnectorStatusBadge from "../components/ui/ConnectorStatusBadge"
import ConnectorConfigForm from "../components/connectors/ConnectorConfigForm"
import ConnectorLogsTable from "../components/connectors/ConnectorLogsTable"
import { connectorsApi } from "../api/connectors"

const TYPE_LABELS = {
  aws_vpc_flow_logs: "VPC Flow Logs",
  aws_waf: "AWS WAF",
  aws_cloudtrail: "AWS CloudTrail",
  aws_cloudwatch: "AWS CloudWatch",
}

export default function ConnectorDetailPage() {
  const { type } = useParams()
  const navigate = useNavigate()
  const [connector, setConnector] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("config")

  useEffect(() => {
    loadConnector()
  }, [type])

  const loadConnector = async () => {
    setLoading(true)
    try {
      const data = await connectorsApi.getAll({ connector_type: type })
      setConnector(data.items[0] || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const label = TYPE_LABELS[type] || type

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/integrations/connectors")}
          className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white">{label}</h2>
            <ConnectorStatusBadge status={connector?.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">AWS connector — Integrations & Data</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-800">
        {["config", "logs"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-indigo-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t === "config" ? "Configuration" : "Logs"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-10 text-center">Loading...</p>
      ) : tab === "config" ? (
        <ConnectorConfigForm
          connectorType={type}
          connector={connector}
          onSaved={setConnector}
        />
      ) : connector ? (
        <ConnectorLogsTable connectorId={connector.id} connectorType={type} />
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center">
          Сначала сохраните конфигурацию на вкладке Configuration.
        </p>
      )}
    </div>
  )
}
