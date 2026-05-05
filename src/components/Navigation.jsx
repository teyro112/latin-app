import { useLocation, useNavigate } from 'react-router-dom'
import { Home, BookOpen, Languages, Bot } from 'lucide-react'

const tabs = [
  { path: '/', label: 'Start', Icon: Home },
  { path: '/vocab', label: 'Vokabeln', Icon: BookOpen },
  { path: '/translate', label: 'Übersetzen', Icon: Languages },
  { path: '/chat', label: 'KI Chat', Icon: Bot },
]

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-slate-800/95 backdrop-blur border-t border-slate-700/50 z-50">
      <div className="flex">
        {tabs.map(({ path, label, Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 transition-colors ${
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-400 active:text-slate-200'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
      <div className="h-safe-inset-bottom bg-slate-800/95" />
    </nav>
  )
}
