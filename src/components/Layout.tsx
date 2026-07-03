interface LayoutProps {
  children: React.ReactNode
  view: 'session' | 'profile' | 'history'
  onNavigate: (view: 'session' | 'profile' | 'history') => void
}

export function Layout({ children, view, onNavigate }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-sky-400">
            DrinkWaterBro <span className="text-lg">💧</span>
          </h1>
        </div>
        <nav className="mt-3 flex gap-1">
          {(
            [
              { id: 'session' as const, label: 'Session' },
              { id: 'history' as const, label: 'History' },
              { id: 'profile' as const, label: 'Profile' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                view === tab.id
                  ? 'bg-sky-600/20 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 py-6">{children}</main>

      <footer className="border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-500">
        Awareness, not optimization. Estimates only — stay safe.
      </footer>
    </div>
  )
}
