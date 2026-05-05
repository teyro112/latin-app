import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VocabTrainer from './pages/VocabTrainer'
import TranslationTrainer from './pages/TranslationTrainer'
import AIChat from './pages/AIChat'
import Navigation from './components/Navigation'

export default function App() {
  return (
    <Router basename="/latin-app">
      <div className="min-h-screen bg-slate-900 text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vocab" element={<VocabTrainer />} />
          <Route path="/translate" element={<TranslationTrainer />} />
          <Route path="/chat" element={<AIChat />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  )
}
