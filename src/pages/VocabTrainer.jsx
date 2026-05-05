import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, RotateCcw, ChevronRight } from 'lucide-react'
import { getBook, getLesson, getRandomWrongAnswers } from '../data/vocabulary'

const MODES = [
  { id: 'flashcard', label: 'Karteikarte' },
  { id: 'multiplechoice', label: 'Multiple Choice' },
  { id: 'typing', label: 'Eintippen' },
]

export default function VocabTrainer() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const bookId = params.get('book')
  const lessonId = params.get('lesson')

  const book = getBook(bookId)
  const lesson = getLesson(bookId, lessonId)

  const [mode, setMode] = useState('flashcard')
  const [direction, setDirection] = useState('latin-german')
  const [cards, setCards] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong'
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [options, setOptions] = useState([])
  const [done, setDone] = useState(false)

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5)

  const buildOptions = useCallback(
    (card, vocab) => {
      const correctAns = direction === 'latin-german' ? card.german : card.form
      const wrongs = getRandomWrongAnswers(vocab, card, 3, direction)
      return shuffleArray([correctAns, ...wrongs])
    },
    [direction]
  )

  useEffect(() => {
    if (lesson) {
      const shuffled = shuffleArray(lesson.vocabulary)
      setCards(shuffled)
      setIndex(0)
      setFlipped(false)
      setSelectedAnswer(null)
      setTypedAnswer('')
      setFeedback(null)
      setScore({ correct: 0, total: 0 })
      setDone(false)
      if (mode === 'multiplechoice' && shuffled.length > 0) {
        setOptions(buildOptions(shuffled[0], lesson.vocabulary))
      }
    }
  }, [lesson, mode, direction])

  useEffect(() => {
    if (mode === 'multiplechoice' && cards.length > 0 && index < cards.length) {
      setOptions(buildOptions(cards[index], lesson.vocabulary))
    }
  }, [index, mode, cards, buildOptions])

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

  const card = cards[index]
  const question = card ? (direction === 'latin-german' ? card.form : card.german) : ''
  const answer = card ? (direction === 'latin-german' ? card.german : card.form) : ''
  const correctAnswer = answer

  const handleNext = () => {
    if (index + 1 >= cards.length) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
      setFlipped(false)
      setSelectedAnswer(null)
      setTypedAnswer('')
      setFeedback(null)
    }
  }

  const handleFlashcardAnswer = (correct) => {
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }))
    handleNext()
  }

  const handleMultipleChoice = (opt) => {
    if (selectedAnswer) return
    const isCorrect = opt === correctAnswer
    setSelectedAnswer(opt)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }))
    setTimeout(handleNext, 1200)
  }

  const handleTypingCheck = () => {
    if (!typedAnswer.trim()) return
    const normalize = (s) => s.trim().toLowerCase().replace(/[.,;!?]$/, '')
    const isCorrect = normalize(typedAnswer) === normalize(correctAnswer)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }))
  }

  const handleReset = () => {
    const shuffled = shuffleArray(lesson.vocabulary)
    setCards(shuffled)
    setIndex(0)
    setFlipped(false)
    setSelectedAnswer(null)
    setTypedAnswer('')
    setFeedback(null)
    setScore({ correct: 0, total: 0 })
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6 safe-bottom">
        <div className="text-6xl">{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
        <h2 className="text-2xl font-bold text-center">Lektion abgeschlossen!</h2>
        <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm text-center border border-slate-700">
          <p className="text-5xl font-bold text-white mb-2">{pct}%</p>
          <p className="text-slate-400">
            {score.correct} von {score.total} richtig
          </p>
          <div className="w-full bg-slate-700 rounded-full h-3 mt-4">
            <div
              className={`h-3 rounded-full transition-all ${
                pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
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
            {index + 1} / {cards.length}
          </p>
        </div>
        <button onClick={handleReset} className="text-slate-400 active:text-white p-1">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-4">
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((index) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="flex justify-center gap-4 mb-4">
        <span className="text-xs text-emerald-400 font-medium bg-emerald-900/30 px-3 py-1 rounded-full">
          ✓ {score.correct}
        </span>
        <span className="text-xs text-red-400 font-medium bg-red-900/30 px-3 py-1 rounded-full">
          ✗ {score.total - score.correct}
        </span>
      </div>

      {/* Mode Tabs */}
      <div className="flex px-4 gap-1 mb-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === m.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 active:bg-slate-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Direction Toggle */}
      <div className="flex px-4 mb-5">
        <button
          onClick={() => setDirection(direction === 'latin-german' ? 'german-latin' : 'latin-german')}
          className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-medium active:bg-slate-700 transition-colors"
        >
          {direction === 'latin-german' ? '🇮🇹 Latein → 🇩🇪 Deutsch' : '🇩🇪 Deutsch → 🇮🇹 Latein'}
          <span className="text-slate-500 ml-2">tippen zum Wechseln</span>
        </button>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 px-4">
        {mode === 'flashcard' && card && (
          <div className="flex flex-col gap-4">
            <div
              className={`flip-card w-full`}
              style={{ height: '200px' }}
              onClick={() => setFlipped((f) => !f)}
            >
              <div
                className={`flip-card-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}
              >
                {/* Front */}
                <div className="flip-card-front absolute inset-0 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center justify-center p-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    {direction === 'latin-german' ? 'Latein' : 'Deutsch'}
                  </p>
                  <p className="text-2xl font-bold text-white text-center italic">{question}</p>
                  <p className="text-xs text-slate-500 mt-4">Tippen zum Umdrehen</p>
                </div>
                {/* Back */}
                <div className="flip-card-back absolute inset-0 bg-indigo-900/40 border border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center p-6">
                  <p className="text-xs text-indigo-400 uppercase tracking-wider mb-3">
                    {direction === 'latin-german' ? 'Deutsch' : 'Latein'}
                  </p>
                  <p className="text-xl font-bold text-white text-center">{answer}</p>
                  {direction === 'german-latin' && card.type && (
                    <span className="mt-2 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                      {card.type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {flipped && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleFlashcardAnswer(false)}
                  className="flex-1 py-4 bg-red-900/40 border border-red-500/30 rounded-2xl text-red-400 font-semibold text-lg active:bg-red-900/60"
                >
                  ✗ Falsch
                </button>
                <button
                  onClick={() => handleFlashcardAnswer(true)}
                  className="flex-1 py-4 bg-emerald-900/40 border border-emerald-500/30 rounded-2xl text-emerald-400 font-semibold text-lg active:bg-emerald-900/60"
                >
                  ✓ Richtig
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'multiplechoice' && card && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                {direction === 'latin-german' ? 'Latein' : 'Deutsch'}
              </p>
              <p className="text-xl font-bold text-white italic">{question}</p>
            </div>

            {options.map((opt, i) => {
              let btnClass = 'bg-slate-800 border-slate-700 text-white'
              if (selectedAnswer) {
                if (opt === correctAnswer) btnClass = 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                else if (opt === selectedAnswer) btnClass = 'bg-red-900/60 border-red-500 text-red-200'
                else btnClass = 'bg-slate-800/40 border-slate-700/40 text-slate-500'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleMultipleChoice(opt)}
                  disabled={!!selectedAnswer}
                  className={`w-full py-3 px-4 rounded-xl border text-left font-medium text-sm transition-colors ${btnClass} active:opacity-80`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {mode === 'typing' && card && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                {direction === 'latin-german' ? 'Latein' : 'Deutsch'}
              </p>
              <p className="text-xl font-bold text-white italic">{question}</p>
            </div>

            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => { setTypedAnswer(e.target.value); setFeedback(null) }}
              onKeyDown={(e) => e.key === 'Enter' && !feedback && handleTypingCheck()}
              placeholder={direction === 'latin-german' ? 'Deutsche Übersetzung...' : 'Lateinische Form...'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors text-base"
              disabled={!!feedback}
              autoComplete="off"
              autoCapitalize="off"
            />

            {feedback && (
              <div
                className={`rounded-xl p-4 border ${
                  feedback === 'correct'
                    ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-900/40 border-red-500/40 text-red-300'
                }`}
              >
                {feedback === 'correct' ? (
                  <p className="font-semibold">✓ Richtig!</p>
                ) : (
                  <>
                    <p className="font-semibold">✗ Falsch</p>
                    <p className="text-sm mt-1">
                      Richtige Antwort: <span className="font-bold text-white">{correctAnswer}</span>
                    </p>
                  </>
                )}
              </div>
            )}

            {!feedback ? (
              <button
                onClick={handleTypingCheck}
                disabled={!typedAnswer.trim()}
                className="w-full py-3 bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-colors active:bg-indigo-700"
              >
                Prüfen
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold active:bg-indigo-700 flex items-center justify-center gap-2"
              >
                Weiter <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
