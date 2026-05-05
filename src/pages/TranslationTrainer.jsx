import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Lightbulb, RotateCcw, Loader2, BookOpen, X } from 'lucide-react'
import { getBook, getLesson } from '../data/vocabulary'

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const AI_MODEL = import.meta.env.VITE_AI_MODEL

async function checkTranslation(latin, userTranslation, correctTranslation) {
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
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content:
            'Du bist ein freundlicher Latein-Lehrer für Gymnasiasten in Bayern. Vergleiche die Schüler-Übersetzung mit der Musterübersetzung. Gib kurzes Feedback auf Deutsch (2-3 Sätze). Sei ermutigend. Falls der Sinn stimmt aber die Wortwahl leicht abweicht, akzeptiere es als richtig. Erkläre kurz eventuelle grammatikalische Fehler.',
        },
        {
          role: 'user',
          content: `Lateinischer Satz: "${latin}"\nMusterübersetzung: "${correctTranslation}"\nSchüler-Übersetzung: "${userTranslation}"\n\nBitte bewerte die Übersetzung.`,
        },
      ],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices[0].message.content
}

export default function TranslationTrainer() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const bookId = params.get('book')
  const lessonId = params.get('lesson')

  const book = getBook(bookId)
  const lesson = getLesson(bookId, lessonId)

  const [sentences, setSentences] = useState([])
  const [index, setIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [aiFeedback, setAiFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [error, setError] = useState(null)
  const [score, setScore] = useState({ done: 0, total: 0 })
  const [done, setDone] = useState(false)
  const [showVocab, setShowVocab] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)

  useEffect(() => {
    if (lesson) {
      setSentences([...lesson.sentences].sort(() => Math.random() - 0.5))
      setIndex(0)
      setUserInput('')
      setAiFeedback(null)
      setShowAnswer(false)
      setError(null)
      setScore({ done: 0, total: lesson.sentences.length })
      setDone(false)
    }
  }, [lesson])

  if (!book || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-slate-400">Keine Lektion ausgewählt.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium"
        >
          Zur Startseite
        </button>
      </div>
    )
  }

  const sentence = sentences[index]

  const handleCheck = async () => {
    if (!userInput.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const fb = await checkTranslation(sentence.latin, userInput, sentence.german)
      setAiFeedback(fb)
    } catch (e) {
      setError('KI nicht verfügbar. Überprüfe deine Internetverbindung.')
    }
    setLoading(false)
  }

  const handleNext = () => {
    if (index + 1 >= sentences.length) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
      setUserInput('')
      setAiFeedback(null)
      setShowAnswer(false)
      setError(null)
      setScore((s) => ({ ...s, done: s.done + 1 }))
    }
  }

  const handleReset = () => {
    setSentences([...lesson.sentences].sort(() => Math.random() - 0.5))
    setIndex(0)
    setUserInput('')
    setAiFeedback(null)
    setShowAnswer(false)
    setError(null)
    setScore({ done: 0, total: lesson.sentences.length })
    setDone(false)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6 safe-bottom">
        <div className="text-6xl">🎓</div>
        <h2 className="text-2xl font-bold text-center">Alle Sätze übersetzt!</h2>
        <p className="text-slate-400 text-center">
          Du hast alle {sentences.length} Sätze aus {lesson.title} bearbeitet.
        </p>
        <div className="flex flex-col w-full max-w-sm gap-3">
          <button
            onClick={handleReset}
            className="bg-indigo-600 text-white py-3 rounded-xl font-semibold"
          >
            Nochmal üben
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-slate-800 text-slate-300 py-3 rounded-xl font-semibold border border-slate-700"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={() => navigate('/')} className="text-slate-400 active:text-white p-1">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            {book.name} · {lesson.title}
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">
            Satz {index + 1} / {sentences.length}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowVocab(true)} className="text-slate-400 active:text-white p-1">
            <BookOpen size={20} />
          </button>
          <button onClick={handleReset} className="text-slate-400 active:text-white p-1">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 mb-6">
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(index / sentences.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-4">
        {/* Latin sentence — tap word to look up */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Lateinisch · Wort antippen zum Nachschlagen</p>
          <p className="text-2xl font-bold text-white italic leading-relaxed flex flex-wrap gap-x-2 gap-y-1">
            {sentence?.latin.split(/(\s+)/).filter(Boolean).map((token, i) => {
              const word = token.trim().replace(/[.,;:!?]/g, '')
              const match = word
                ? lesson.vocabulary.find((v) =>
                    v.latin.toLowerCase() === word.toLowerCase() ||
                    v.form.toLowerCase().startsWith(word.toLowerCase())
                  )
                : null
              if (!word) return <span key={i}>{token}</span>
              return (
                <span
                  key={i}
                  onClick={() => match && setSelectedWord(selectedWord?.id === match.id ? null : match)}
                  className={match ? 'cursor-pointer underline decoration-dotted decoration-emerald-400 text-emerald-200 active:opacity-70' : ''}
                >
                  {token}
                </span>
              )
            })}
          </p>
          {selectedWord && (
            <div className="mt-4 pt-3 border-t border-slate-700 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-base italic">{selectedWord.latin}</span>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{selectedWord.type}</span>
              </div>
              <p className="text-slate-300 text-sm font-mono">{selectedWord.form}</p>
              <p className="text-white font-semibold">{selectedWord.german}</p>
            </div>
          )}
        </div>

        {/* User input */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Deine Übersetzung</p>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Übersetze den Satz auf Deutsch..."
            rows={3}
            disabled={loading || !!aiFeedback}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors resize-none text-base"
          />
        </div>

        {/* Hint button */}
        {!aiFeedback && !showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="flex items-center gap-2 text-amber-400 text-sm font-medium py-2 active:opacity-70"
          >
            <Lightbulb size={16} />
            Musterlösung anzeigen
          </button>
        )}

        {showAnswer && sentence && (
          <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-4">
            <p className="text-xs text-amber-400 font-semibold mb-1">Musterlösung</p>
            <p className="text-white">{sentence.german}</p>
          </div>
        )}

        {/* AI Feedback */}
        {aiFeedback && (
          <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4">
            <p className="text-xs text-indigo-400 font-semibold mb-2">KI-Feedback</p>
            <p className="text-slate-200 text-sm leading-relaxed">{aiFeedback}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={handleCheck} className="text-xs text-red-300 mt-2 underline">
              Nochmal versuchen
            </button>
          </div>
        )}

        {/* Action buttons */}
        {!aiFeedback ? (
          <button
            onClick={handleCheck}
            disabled={!userInput.trim() || loading}
            className="w-full py-4 bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold text-base transition-colors active:bg-emerald-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                KI prüft...
              </>
            ) : (
              'Übersetzung prüfen'
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold text-base active:bg-indigo-700 flex items-center justify-center gap-2"
          >
            {index + 1 >= sentences.length ? 'Fertig 🎉' : <>Nächster Satz <ChevronRight size={18} /></>}
          </button>
        )}
      </div>
      {/* Vocab drawer */}
      {showVocab && (
        <div className="fixed inset-0 z-50 flex flex-col" onClick={() => { setShowVocab(false); setSelectedWord(null) }}>
          <div className="flex-1" />
          <div
            className="bg-slate-900 border-t border-slate-700 rounded-t-2xl max-h-[75vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <p className="font-semibold text-white">Vokabeln — {lesson.title}</p>
              <button onClick={() => { setShowVocab(false); setSelectedWord(null) }} className="text-slate-400 active:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2">
              {lesson.vocabulary.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedWord(selectedWord?.id === v.id ? null : v)}
                  className="text-left w-full"
                >
                  <div className={`rounded-xl px-4 py-3 border transition-colors ${selectedWord?.id === v.id ? 'bg-emerald-900/40 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white italic">{v.latin}</span>
                      <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">{v.type}</span>
                    </div>
                    {selectedWord?.id === v.id && (
                      <div className="mt-2 pt-2 border-t border-emerald-700/40 flex flex-col gap-1">
                        <p className="text-sm text-slate-300 font-mono">{v.form}</p>
                        <p className="text-base text-emerald-300 font-medium">{v.german}</p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
