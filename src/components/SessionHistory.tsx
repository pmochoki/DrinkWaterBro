import { getZoneLabel } from '../lib/bac'
import { formatBAC, formatDuration } from '../lib/units'
import type { CompletedSession } from '../types'

interface SessionHistoryProps {
  sessions: CompletedSession[]
  onBack: () => void
}

export function SessionHistory({ sessions, onBack }: SessionHistoryProps) {
  const weekSessions = sessions.filter(
    (s) => Date.now() - s.endedAt < 7 * 24 * 60 * 60 * 1000,
  )
  const totalDrinks = weekSessions.reduce((sum, s) => sum + s.drinks.length, 0)

  return (
    <div className="flex min-h-dvh flex-col px-4 py-6">
      <button onClick={onBack} className="mb-4 text-sm text-water">
        ← Back
      </button>

      <h2 className="text-2xl font-black text-white">Your sessions</h2>
      <p className="mt-1 text-sm text-slate-400">
        This week: {weekSessions.length} session{weekSessions.length !== 1 ? 's' : ''}, {totalDrinks} drink{totalDrinks !== 1 ? 's' : ''}
      </p>

      {sessions.length === 0 ? (
        <p className="mt-8 text-center text-slate-500">No sessions yet — your history will show up here.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {sessions.map((session) => {
            const date = new Date(session.endedAt)
            const duration = session.endedAt - session.startedAt
            return (
              <li
                key={session.id}
                className="rounded-2xl bg-surface-light px-4 py-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {date.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {session.drinks.length} drink{session.drinks.length !== 1 ? 's' : ''} · {formatDuration(duration)} · peak {getZoneLabel(session.peakZone)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">
                      {formatBAC(session.peakBac)}
                    </p>
                    {session.recoveryRating && (
                      <p className="text-xs text-slate-500">
                        Felt {session.recoveryRating}/5 next day
                      </p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
