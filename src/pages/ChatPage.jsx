import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { aiApi } from "../api/ai"

/*
  ChatPage — AI чат с историей.

  Как работает:
  1. Пользователь пишет вопрос
  2. Добавляем в messages[] и отправляем историю в /ai/chat
  3. Backend передаёт историю в OpenAI → AI учитывает контекст
  4. Ответ добавляем в messages[]
  5. React перерисовывает чат
*/

const SUGGESTIONS = [
  "Какие критические алерты за последние 24 часа?",
  "Что нужно сделать в первую очередь?",
  "Есть ли подозрительная активность?",
  "Сгенерируй краткий отчёт по безопасности",
]

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Привет! Я SentinelIQ AI — твой security аналитик. Спроси меня о текущих угрозах, алертах или попроси сгенерировать отчёт.",
    },
  ])
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Автоскролл вниз при новом сообщении
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return

    // Добавляем сообщение пользователя
    const newMessages = [...messages, { role: "user", content: userText }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      // Отправляем историю (без первого приветствия assistant)
      const history = newMessages.slice(1, -1)   // убираем системное и последнее
      const { answer } = await aiApi.chat(userText, history)

      setMessages(prev => [...prev, { role: "assistant", content: answer }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Ошибка связи с AI. Проверь OPENAI_API_KEY в .env файле.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    // Enter отправляет, Shift+Enter — новая строка
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* ── ЗАГОЛОВОК ──────────────────────────── */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">AI Security Chat</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Ask about threats, findings, or request security reports
        </p>
      </div>

      {/* ── СООБЩЕНИЯ ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Аватар */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center
                             justify-center ${
                               msg.role === "assistant"
                                 ? "bg-indigo-600"
                                 : "bg-gray-700"
                             }`}>
              {msg.role === "assistant"
                ? <Bot size={16} className="text-white" />
                : <User size={16} className="text-gray-300" />
              }
            </div>

            {/* Текст */}
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                             whitespace-pre-wrap ${
                               msg.role === "assistant"
                                 ? "bg-gray-800 text-gray-100 rounded-tl-sm"
                                 : "bg-indigo-600 text-white rounded-tr-sm"
                             }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Индикатор загрузки */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── SUGGESTIONS ────────────────────────── */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs text-indigo-400 bg-indigo-950 border border-indigo-900
                         px-3 py-1.5 rounded-full hover:bg-indigo-900 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── ВВОД ───────────────────────────────── */}
      <div className="flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about security threats... (Enter to send)"
          rows={1}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl
                     px-4 py-3 text-sm text-white placeholder-gray-600
                     focus:outline-none focus:border-indigo-500
                     resize-none transition-colors"
          style={{ minHeight: "48px", maxHeight: "120px" }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                     text-white p-3 rounded-xl transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  )
}
