import { useState, useRef, useEffect } from 'react'
import { Send, ImagePlus, X, Loader2, Trash2, Bot } from 'lucide-react'

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const AI_MODEL = import.meta.env.VITE_AI_MODEL

const SYSTEM_PROMPT = `Du bist ein hilfsbereiter Latein-Assistent für Gymnasiasten in Bayern.
Du hilfst beim Lateinlernen: Grammatik, Vokabeln, Übersetzungen, Deklinationen, Konjugationen.
Antworte immer auf Deutsch. Sei freundlich, klar und kurz.
Wenn du Bilder siehst (z.B. Fotos aus Lehrbüchern), analysiere sie und beantworte Fragen dazu.`

const SUGGESTIONS = [
  'Erkläre die a-Deklination',
  'Was ist der Unterschied zwischen Ablativ und Dativ?',
  'Wie konjugiert man "amare"?',
  'Erkläre den Ablativus absolutus',
]

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hallo! Ich bin dein Latein-KI-Assistent. Stelle mir eine Frage zu Grammatik, Vokabeln oder Übersetzungen – du kannst auch ein Bild aus deinem Lehrbuch hochladen! 📚',
      image: null,
    },
  ])
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null) // { base64, preview }
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImage({ base64: ev.target.result, preview: ev.target.result })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const buildContent = (text, imgBase64) => {
    if (imgBase64) {
      return [
        { type: 'text', text: text || 'Was siehst du auf diesem Bild? Hilf mir damit.' },
        { type: 'image_url', image_url: { url: imgBase64 } },
      ]
    }
    return text
  }

  const handleSend = async (overrideText) => {
    const text = (overrideText || input).trim()
    if (!text && !image) return

    const userMsg = { role: 'user', content: text, image: image?.preview || null }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setImage(null)
    setLoading(true)

    try {
      const apiMessages = newMessages
        .filter((m) => m.role !== 'assistant' || m !== messages[0])
        .map((m) => ({
          role: m.role,
          content:
            m.role === 'user' && m.image
              ? buildContent(m.content, m.image)
              : m.content,
        }))

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'LateinApp Buchloe',
        },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 600,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...apiMessages],
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const reply = data.choices[0].message.content
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, image: null }])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Fehler: ' + (e.message || 'KI nicht verfügbar. Überprüfe deine Internetverbindung.'),
          image: null,
        },
      ])
    }
    setLoading(false)
  }

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat geleert. Wie kann ich dir helfen? 📚',
        image: null,
      },
    ])
    setInput('')
    setImage(null)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Latein KI-Assistent</p>
            <p className="text-xs text-slate-500">Gemini 2.0 Flash</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="text-slate-500 active:text-red-400 p-2 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-messages px-4 py-4 pb-2 space-y-4" style={{ paddingBottom: image ? '220px' : '120px' }}>
        {/* Suggestions (only at start) */}
        {messages.length === 1 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 text-center mb-1">Vorschläge</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-left text-sm bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-slate-300 active:bg-slate-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-violet-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-violet-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/50'
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Hochgeladenes Bild"
                  className="rounded-xl mb-2 max-w-full max-h-48 object-contain"
                />
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-2">
            <div className="w-7 h-7 bg-violet-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-violet-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-violet-400" />
              <span className="text-sm text-slate-400">Antwortet...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-slate-900 border-t border-slate-800 px-4 pt-2 safe-bottom">
        {/* Image preview */}
        {image && (
          <div className="relative inline-block mb-2">
            <img
              src={image.preview}
              alt="Vorschau"
              className="h-16 w-auto rounded-xl border border-slate-700 object-cover"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 pb-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-10 h-10 flex-shrink-0 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 active:bg-slate-700 active:text-white transition-colors"
          >
            <ImagePlus size={18} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Frage stellen oder Bild hochladen..."
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 outline-none focus:border-violet-500 transition-colors resize-none text-sm max-h-24"
            style={{ height: 'auto', minHeight: '40px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !image)}
            className="w-10 h-10 flex-shrink-0 bg-violet-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl flex items-center justify-center transition-colors active:bg-violet-700"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
