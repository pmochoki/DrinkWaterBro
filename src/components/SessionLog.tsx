import type { DrinkEntry, FoodEntry, WaterEntry } from '../types'
import { ZONE_CONFIG, formatBAC } from '../lib/bac'

interface SessionLogProps {
  drinks: DrinkEntry[]
  food: FoodEntry[]
  water: WaterEntry[]
  startedAt: number
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3_600_000)
  const mins = Math.floor((ms % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function SessionLog({ drinks, food, water, startedAt }: SessionLogProps) {
  const elapsed = Date.now() - startedAt

  if (drinks.length === 0 && food.length === 0 && water.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500">
        Session started · {formatDuration(elapsed)} ago
      </p>
    )
  }

  const events = [
    ...drinks.map((d) => ({ ...d, kind: 'drink' as const })),
    ...food.map((f) => ({ ...f, kind: 'food' as const })),
    ...water.map((w) => ({ ...w, kind: 'water' as const })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-slate-400">
        <span>Session log</span>
        <span>{formatDuration(elapsed)} elapsed</span>
      </div>

      <ul className="max-h-48 space-y-2 overflow-y-auto">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2 text-sm"
          >
            {event.kind === 'drink' && (
              <>
                <span>🍺 {event.type}</span>
                <span className="text-slate-400">
                  {event.volumeMl}ml · {event.abvPercent}% · {formatTime(event.timestamp)}
                </span>
              </>
            )}
            {event.kind === 'food' && (
              <>
                <span>🍽️ {event.description}</span>
                <span className="text-slate-400">{formatTime(event.timestamp)}</span>
              </>
            )}
            {event.kind === 'water' && (
              <>
                <span>💧 Water</span>
                <span className="text-slate-400">
                  {event.volumeMl}ml · {formatTime(event.timestamp)}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
