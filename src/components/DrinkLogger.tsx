import { useState } from 'react'
import { QUICK_DRINKS } from '../lib/constants'
import { ozToMl } from '../lib/units'
import type { DrinkEntry, QuickDrink, VolumeUnit } from '../types'

interface DrinkLoggerProps {
  onAdd: (drink: Omit<DrinkEntry, 'id'>) => void
}

export function DrinkLogger({ onAdd }: DrinkLoggerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [editingQuick, setEditingQuick] = useState<QuickDrink | null>(null)

  function quickAdd(drink: QuickDrink) {
    onAdd({
      name: drink.name,
      volumeMl: drink.volumeMl,
      abvPercent: drink.abvPercent,
      timestamp: Date.now(),
    })
  }

  function quickAddWithEdit(drink: QuickDrink, volumeMl: number, abvPercent: number) {
    onAdd({
      name: drink.name,
      volumeMl,
      abvPercent,
      timestamp: Date.now(),
    })
    setEditingQuick(null)
  }

  if (showCustom) {
    return (
      <CustomDrinkForm
        onAdd={(d) => {
          onAdd(d)
          setShowCustom(false)
        }}
        onCancel={() => setShowCustom(false)}
      />
    )
  }

  if (editingQuick) {
    return (
      <QuickDrinkEdit
        drink={editingQuick}
        onConfirm={quickAddWithEdit}
        onCancel={() => setEditingQuick(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-slate-400">Quick add</p>
      <div className="grid grid-cols-3 gap-2">
        {QUICK_DRINKS.map((drink) => (
          <button
            key={drink.id}
            onClick={() => quickAdd(drink)}
            onContextMenu={(e) => {
              e.preventDefault()
              setEditingQuick(drink)
            }}
            className="flex flex-col items-center gap-1 rounded-2xl bg-surface-light py-4 transition-transform active:scale-95"
          >
            <span className="text-2xl">{drink.emoji}</span>
            <span className="text-xs font-medium text-slate-300">{drink.name}</span>
            <span className="text-xs text-slate-500">
              {drink.abvPercent}% · {drink.volumeMl}ml
            </span>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-600">Long-press to edit before adding</p>
      <button
        onClick={() => setShowCustom(true)}
        className="w-full rounded-2xl border border-dashed border-slate-600 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-water hover:text-water"
      >
        + Custom drink
      </button>
    </div>
  )
}

function QuickDrinkEdit({
  drink,
  onConfirm,
  onCancel,
}: {
  drink: QuickDrink
  onConfirm: (drink: QuickDrink, volumeMl: number, abvPercent: number) => void
  onCancel: () => void
}) {
  const [volumeMl, setVolumeMl] = useState(drink.volumeMl.toString())
  const [abv, setAbv] = useState(drink.abvPercent.toString())

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface-light p-4">
      <p className="text-center text-lg font-bold">
        {drink.emoji} {drink.name}
      </p>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-400">Volume (ml)</span>
        <input
          type="number"
          inputMode="decimal"
          value={volumeMl}
          onChange={(e) => setVolumeMl(e.target.value)}
          className="rounded-xl bg-surface px-4 py-3 text-white outline-none ring-water focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-400">ABV %</span>
        <input
          type="number"
          inputMode="decimal"
          value={abv}
          onChange={(e) => setAbv(e.target.value)}
          className="rounded-xl bg-surface px-4 py-3 text-white outline-none ring-water focus:ring-2"
        />
      </label>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl bg-surface py-3 text-slate-400"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onConfirm(drink, parseFloat(volumeMl), parseFloat(abv))
          }
          className="flex-1 rounded-xl bg-water py-3 font-bold text-surface"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function CustomDrinkForm({
  onAdd,
  onCancel,
}: {
  onAdd: (drink: Omit<DrinkEntry, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [volume, setVolume] = useState('')
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('ml')
  const [abv, setAbv] = useState('')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const vol = parseFloat(volume)
    const abvNum = parseFloat(abv)
    if (!name || !vol || !abvNum) return

    const volumeMl = volumeUnit === 'ml' ? vol : ozToMl(vol)
    onAdd({
      name,
      volumeMl,
      abvPercent: abvNum,
      timestamp: new Date(timestamp).getTime(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-surface-light p-4">
      <p className="text-lg font-bold text-white">Custom drink</p>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-400">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Margarita"
          className="rounded-xl bg-surface px-4 py-3 text-white outline-none ring-water focus:ring-2"
          required
        />
      </label>
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-slate-400">Volume</span>
          <input
            type="number"
            inputMode="decimal"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="rounded-xl bg-surface px-4 py-3 text-white outline-none ring-water focus:ring-2"
            required
          />
        </label>
        <div className="flex flex-col justify-end">
          <div className="flex rounded-xl bg-surface p-1">
            {(['ml', 'oz'] as VolumeUnit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setVolumeUnit(u)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  volumeUnit === u
                    ? 'bg-water text-surface'
                    : 'text-slate-400'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-400">ABV %</span>
        <input
          type="number"
          inputMode="decimal"
          value={abv}
          onChange={(e) => setAbv(e.target.value)}
          placeholder="12"
          className="rounded-xl bg-surface px-4 py-3 text-white outline-none ring-water focus:ring-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-400">When</span>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="rounded-xl bg-surface px-4 py-3 text-white outline-none ring-water focus:ring-2"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-surface py-3 text-slate-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-water py-3 font-bold text-surface"
        >
          Add drink
        </button>
      </div>
    </form>
  )
}
