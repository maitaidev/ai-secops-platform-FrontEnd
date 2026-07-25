import { useState } from "react"
import { Zap, Save, Copy, Check } from "lucide-react"
import { connectorsApi } from "../../api/connectors"

/*
  ConnectorConfigForm — форма подключения AWS-коннектора: Role ARN, S3 bucket,
  SQS queue + панель trust policy (наш platform_principal_arn + external_id
  коннектора), которую клиент вставляет в IAM-роль у себя в аккаунте.
  Аналог мастера подключения AWS-коннектора в Microsoft Sentinel.
*/

const FIELDS = [
  { key: "name",           label: "Connector name",  placeholder: "Production VPC Flow Logs" },
  { key: "aws_account_id", label: "AWS Account ID",  placeholder: "123456789012" },
  { key: "region",         label: "AWS Region",      placeholder: "us-east-1" },
  { key: "role_arn",       label: "Role ARN",        placeholder: "arn:aws:iam::123456789012:role/secops-connector" },
  { key: "s3_bucket",      label: "S3 bucket",       placeholder: "my-vpc-flow-logs-bucket" },
  { key: "s3_prefix",      label: "S3 prefix (опционально)", placeholder: "AWSLogs/" },
  { key: "sqs_queue_url",  label: "SQS queue URL",   placeholder: "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue" },
]

const EMPTY_FORM = {
  name: "", aws_account_id: "", region: "us-east-1", role_arn: "",
  s3_bucket: "", s3_prefix: "", sqs_queue_url: "",
}

export default function ConnectorConfigForm({ connectorType, connector, onSaved }) {
  const [form, setForm] = useState(() => connector ? { ...EMPTY_FORM, ...connector } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setTestResult(null)
    try {
      const body = {
        name: form.name,
        aws_account_id: form.aws_account_id,
        region: form.region,
        role_arn: form.role_arn,
        s3_bucket: form.s3_bucket,
        s3_prefix: form.s3_prefix || null,
        sqs_queue_url: form.sqs_queue_url,
      }
      const saved = connector
        ? await connectorsApi.update(connector.id, body)
        : await connectorsApi.create({ connector_type: connectorType, ...body })
      setForm({ ...EMPTY_FORM, ...saved })
      onSaved?.(saved)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!connector) return
    setTesting(true)
    setTestResult(null)
    try {
      const result = await connectorsApi.testConnection(connector.id)
      setTestResult(result)
      onSaved?.({ ...connector, status: result.success ? "connected" : "error" })
    } catch (err) {
      console.error(err)
    } finally {
      setTesting(false)
    }
  }

  const trustPolicy = connector ? JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Principal: { AWS: connector.platform_principal_arn || "<CONNECTORS_PLATFORM_PRINCIPAL_ARN not configured>" },
      Action: "sts:AssumeRole",
      Condition: { StringEquals: { "sts:ExternalId": connector.external_id } },
    }],
  }, null, 2) : null

  const handleCopy = () => {
    if (!trustPolicy) return
    navigator.clipboard.writeText(trustPolicy)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className={key === "sqs_queue_url" || key === "role_arn" ? "sm:col-span-2" : ""}>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</label>
            <input
              value={form[key] ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg
                         px-3 py-2 text-sm text-white placeholder-gray-600
                         focus:outline-none focus:border-indigo-500"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 text-sm text-white bg-indigo-600
                     hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg"
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save configuration"}
        </button>
        {connector && (
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800
                       hover:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded-lg"
          >
            <Zap size={14} />
            {testing ? "Testing..." : "Test Connection"}
          </button>
        )}
      </div>

      {testResult && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          testResult.success
            ? "bg-green-950 border-green-800 text-green-400"
            : "bg-red-950 border-red-800 text-red-400"
        }`}>
          {testResult.message}
        </div>
      )}

      {/* ── TRUST POLICY ───────────────────────── */}
      {connector ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-white">Trust policy (IAM role)</h3>
            <p className="text-xs text-gray-500 mt-1">
              Создайте в своём AWS-аккаунте IAM-роль с этой trust policy, чтобы разрешить нам
              подключаться через <code className="text-gray-400">sts:AssumeRole</code>. External ID
              уникален для этого коннектора.
            </p>
          </div>
          <div className="relative">
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
{trustPolicy}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-400
                         hover:text-white bg-gray-800 px-2 py-1 rounded"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Роли также нужны права: <code className="text-gray-400">s3:GetObject</code>,{" "}
            <code className="text-gray-400">s3:ListBucket</code>,{" "}
            <code className="text-gray-400">sqs:ReceiveMessage</code>,{" "}
            <code className="text-gray-400">sqs:DeleteMessage</code>,{" "}
            <code className="text-gray-400">sqs:GetQueueAttributes</code>,{" "}
            <code className="text-gray-400">sqs:ChangeMessageVisibility</code>.
          </p>
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Сохраните конфигурацию, чтобы получить External ID и trust policy для вашей IAM-роли.
        </p>
      )}
    </div>
  )
}
