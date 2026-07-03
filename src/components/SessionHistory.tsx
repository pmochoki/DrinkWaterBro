import type { SessionSummary } from '../types'
import { ZONE_CONFIG, formatBAC } from '../lib/bac'

interface SessionHistoryProps {
  sessions: SessionSummary[]
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500">
        No past sessions yet. Your history will show up here.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sky-300">Past sessions</h3>
      <ul className="space-y-2">
        {sessions.map((s) => {
          const zoneConfig = ZONE_CONFIG[s.peakZone]
          return (
            <li
              key={s.id}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{formatDate(s.startedAt)}</p>
                  <p className="text-xs text-slate-400">
                    {formatTime(s.startedAt)} – {formatTime(s.endedAt)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${zoneConfig.bg} ${zoneConfig.color}`}>
                  {zoneConfig.label}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-slate-400">
                <span>{s.drinkCount} drinks</span>
                <span>Peak: {formatBAC(s.peakBacPercent)}%</span>
                {s.limitReached && (
                  <span className="text-danger">Limit reached</span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
