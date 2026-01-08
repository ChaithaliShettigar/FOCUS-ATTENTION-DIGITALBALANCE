import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFocusStore } from '../store/useFocusStore'
import { useTranslation } from 'react-i18next'

const jokes = [
  'Why did the student bring a ladder to class? Because the assignment was high level! 📚',
  'Debugging: removing needles from haystacks one print at a time.',
  'Focus tip: tab-switch squats burn 0 calories. Stay in FocusUp instead! 💪',
]

export const HelpBot = () => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [voice, setVoice] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I only search inside FocusUp. Ask me for PDFs or links you have here.' },
  ])
  const contents = useFocusStore((s) => s.contents)
  const groups = useFocusStore((s) => s.groups)
  const language = useFocusStore((s) => s.language)

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language, i18n])

  const speak = (text) => {
    if (!voice || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = language.startsWith('es') ? 'es-ES' : 'en-US'
    window.speechSynthesis.speak(utter)
  }

  const searchInternal = (query) => {
    const lower = query.toLowerCase()
    const contentMatches = contents.filter((c) =>
      c.title.toLowerCase().includes(lower) || (c.type === 'youtube' && c.url.toLowerCase().includes(lower))
    )

    const groupResources = groups.flatMap((g) => g.resources || [])
    const groupMatches = groupResources.filter((r) =>
      r.title?.toLowerCase().includes(lower) || r.url?.toLowerCase().includes(lower)
    )

    return [...contentMatches, ...groupMatches]
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMessage = { sender: 'user', text: input }
    const results = searchInternal(input)
    const reply =
      results.length === 0
        ? 'No one has shared this yet in your groups or library.'
        : `I found ${results.length} item(s): ${results
            .map((r) => `${r.title} (${r.type || r.kind || 'resource'})`)
            .join(', ')}`

    const botMessage = { sender: 'bot', text: reply }
    setMessages((prev) => [...prev, userMessage, botMessage])
    speak(reply)
    setInput('')
  }

  const randomJoke = useMemo(() => jokes[Math.floor(Math.random() * jokes.length)], [])

  return (
    <div className="fixed bottom-6 right-4 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-3 w-[320px] rounded-3xl border border-ink/10 bg-white/90 shadow-soft backdrop-blur-lg"
          >
            <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-accent/90 to-leaf/80 px-4 py-3 text-ink">
              <div className="font-semibold">AI HelpBot</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/70 px-2 text-xs font-bold text-ink"
              >
                ✕
              </button>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto px-4 py-3 text-sm scroll-hide">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 shadow-sm ${
                      m.sender === 'bot' ? 'bg-clay/60 text-ink' : 'bg-ink text-sand'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 pb-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for PDFs or links here"
                className="flex-1 rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
              <button
                onClick={handleSend}
                className="rounded-2xl bg-ink px-3 py-2 text-xs font-semibold text-sand shadow-soft"
              >
                Send
              </button>
            </div>
            <div className="flex items-center justify-between px-4 pb-4 text-xs text-ink/70">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={voice}
                  onChange={(e) => setVoice(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Voice replies
              </label>
              <button
                onClick={() => setMessages((prev) => [...prev, { sender: 'bot', text: randomJoke }])}
                className="rounded-full bg-clay px-3 py-1 font-semibold"
              >
                Joke
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        className="glow-card flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-sand shadow-soft"
      >
        🤖 AI HelpBot
        <span className="rounded-full bg-sand/20 px-2 text-[10px]">text + voice</span>
      </button>
    </div>
  )
}
