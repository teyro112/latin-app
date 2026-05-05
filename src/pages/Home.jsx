import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, BookOpen, Languages } from 'lucide-react'
import { BOOKS } from '../data/vocabulary'

export default function Home() {
  const navigate = useNavigate()
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)

  const book = BOOKS.find((b) => b.id === selectedBook)

  if (selectedLesson && book) {
    const lesson = book.lessons.find((l) => l.id === selectedLesson)
    return (
      <div className="safe-bottom px-4 pt-6">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-1 text-slate-400 mb-6 active:text-white transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Zurück zu Lektionen</span>
        </button>

        <div className={`rounded-2xl p-4 mb-6 ${book.colorDark} border ${book.colorBorder}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${book.colorText}`}>
            {book.name}
          </p>
          <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
          <p className="text-slate-400 text-sm mt-1">{lesson.topic}</p>
          <div className="flex gap-3 mt-3 text-xs text-slate-400">
            <span>{lesson.vocabulary.length} Vokabeln</span>
            <span>•</span>
            <span>{lesson.sentences.length} Sätze</span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Trainer auswählen
        </h3>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/vocab?book=${selectedBook}&lesson=${selectedLesson}`)}
            className="flex items-center gap-4 bg-slate-800 rounded-2xl p-4 border border-slate-700 active:bg-slate-700 transition-colors"
          >
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} className="text-indigo-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white">Vokabeltrainer</p>
              <p className="text-sm text-slate-400 mt-0.5">
                Karteikarten · Multiple Choice · Eintippen
              </p>
            </div>
            <ChevronRight size={18} className="text-slate-500" />
          </button>

          <button
            onClick={() => navigate(`/translate?book=${selectedBook}&lesson=${selectedLesson}`)}
            className="flex items-center gap-4 bg-slate-800 rounded-2xl p-4 border border-slate-700 active:bg-slate-700 transition-colors"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Languages size={24} className="text-emerald-400" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white">Übersetzungstrainer</p>
              <p className="text-sm text-slate-400 mt-0.5">
                Sätze mit KI-Feedback übersetzen
              </p>
            </div>
            <ChevronRight size={18} className="text-slate-500" />
          </button>
        </div>
      </div>
    )
  }

  if (selectedBook && book) {
    return (
      <div className="safe-bottom px-4 pt-6">
        <button
          onClick={() => setSelectedBook(null)}
          className="flex items-center gap-1 text-slate-400 mb-4 active:text-white transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Zurück zu Büchern</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{book.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{book.name}</h1>
            <p className="text-slate-400 text-sm">{book.description}</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Lektion wählen
        </h3>

        <div className="flex flex-col gap-2">
          {book.lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className="flex items-center gap-4 bg-slate-800 rounded-xl p-4 border border-slate-700/50 active:bg-slate-700 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${book.colorDark}`}>
                <span className={`text-sm font-bold ${book.colorText}`}>{lesson.id}</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-white text-sm">{lesson.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{lesson.topic}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{lesson.vocabulary.length} Vok.</p>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="safe-bottom px-4 pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🏛️</span>
          <h1 className="text-2xl font-bold">LateinApp</h1>
        </div>
        <p className="text-slate-400 text-sm">Gymnasium Buchloe</p>
      </div>

      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Buch wählen
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {BOOKS.map((book) => (
          <button
            key={book.id}
            onClick={() => setSelectedBook(book.id)}
            className={`rounded-2xl p-4 text-left border ${book.colorBorder} ${book.colorDark} active:opacity-80 transition-opacity`}
          >
            <span className="text-3xl mb-3 block">{book.emoji}</span>
            <p className={`font-bold text-base ${book.colorText}`}>{book.name}</p>
            <p className="text-xs text-slate-400 mt-1">{book.lessons.length} Lektionen</p>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/30">
        <p className="text-xs text-slate-400 text-center">
          💡 Tippe auf ein Buch, dann wähle eine Lektion und starte deinen Trainer.
        </p>
      </div>
    </div>
  )
}
