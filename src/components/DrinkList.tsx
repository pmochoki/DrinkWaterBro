import { useState } from 'react'
import { formatTimeSince, mlToOz } from '../lib/units'
import type { DrinkEntry } from '../types'

interface DrinkListProps {
  drinks: DrinkEntry[]
  now: number
  onUpdate: (id: string, updates: Partial<DrinkEntry>) => void
  onDelete: (id: string) => void
}

export function DrinkList({ drinks, now, onUpdate, onDelete }: DrinkListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (drinks.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500 py-4">
        No drinks logged yet. Tap a quick-add above!
      </p>
    )
  }

  const sorted = [...drinks].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-400">
        Tonight's drinks ({drinks.length})
      </p>
      {sorted.map((drink) =>
        editingId === drink.id ? (
          <DrinkEditRow
            key={drink.id}
            drink={drink}
            onSave={(updates) => {
              onUpdate(drink.id, updates)
              setEditingId(null)
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={drink.id}
            className="flex items-center gap-3 rounded-xl bg-surface-light px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{drink.name}</p>
              <p className="text-xs text-slate-400">
                {drink.abvPercent}% · {drink.volumeMl}ml ({mlToOz(drink.volumeMl).toFixed(1)}oz)
                · {formatTimeSince(drink.timestamp, now)}
              </p>
            </div>
            <button
              onClick={() => setEditingId(drink.id)}
              className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(drink.id)}
              className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ),
      )}
    </div>
  )
}

function DrinkEditRow({
  drink,
  onSave,
  onCancel,
}: {
  drink: DrinkEntry
  onSave: (updates: Partial<DrinkEntry>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(drink.name)
  const [volumeMl, setVolumeMl] = useState(drink.volumeMl.toString())
  const [abv, setAbv] = useState(drink.abvPercent.toString())
  const [timestamp, setTimestamp] = useState(() => {
    const d = new Date(drink.timestamp)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-surface-card p-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg bg-surface px-3 py-2 text-white outline-none"
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={volumeMl}
          onChange={(e) => setVolumeMl(e.target.value)}
          placeholder="ml"
          className="flex-1 rounded-lg bg-surface px-3 py-2 text-white outline-none"
        />
        <input
          type="number"
          value={abv}
          onChange={(e) => setAbv(e.target.value)}
          placeholder="ABV%"
          className="w-20 rounded-lg bg-surface px-3 py-2 text-white outline-none"
        />
      </div>
      <input
        type="datetime-local"
        value={timestamp}
        onChange={(e) => setTimestamp(e.target.value)}
        className="rounded-lg bg-surface px-3 py-2 text-white outline-none"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 rounded-lg bg-surface py-2 text-sm text-slate-400">
          Cancel
        </button>
        <button
          onClick={() =>
            onSave({
              name,
              volumeMl: parseFloat(volumeMl),
              abvPercent: parseFloat(abv),
              timestamp: new Date(timestamp).getTime(),
            })
          }
          className="flex-1 rounded-lg bg-water py-2 text-sm font-bold text-surface"
        >
          Save
        </button>
      </div>
    </div>
  )
}
