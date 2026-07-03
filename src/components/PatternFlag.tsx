import { getResources } from '../lib/patterns'

interface PatternFlagProps {
  message: string
  country?: string
  onDismiss: () => void
}

export function PatternFlag({ message, country, onDismiss }: PatternFlagProps) {
  const resources = getResources(country)

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4">
      <p className="text-sm leading-relaxed text-amber-100/90">{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {resources.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-surface-light px-3 py-1.5 text-xs text-water"
          >
            {r.name}
          </a>
        ))}
      </div>
      <button
        onClick={onDismiss}
        className="mt-3 text-xs text-slate-400 underline"
      >
        Thanks, I got it
      </button>
    </div>
  )
}
