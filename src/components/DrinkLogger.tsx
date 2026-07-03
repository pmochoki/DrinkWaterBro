import { useState } from 'react'
import { DRINK_PRESETS } from '../lib/drinks'
import { standardDrinks } from '../lib/bac'

interface DrinkLoggerProps {
  onAdd: (type: string, volumeMl: number, abvPercent: number) => void
}

export function DrinkLogger({ onAdd }: DrinkLoggerProps) {
  const [selected, setSelected] = useState(0)
  const [customVolume, setCustomVolume] = useState(355)
  const [customAbv, setCustomAbv] = useState(5)
  const [customType, setCustomType] = useState('Custom drink')

  const preset = DRINK_PRESETS[selected]
  const isCustom = preset.type === 'Custom'
  const volume = isCustom ? customVolume : preset.volumeMl
  const abv = isCustom ? customAbv : preset.abvPercent
  const type = isCustom ? customType : preset.type
  const stdDrinks = standardDrinks(volume, abv)

  function handleAdd() {
    if (volume <= 0 || abv <= 0) return
    onAdd(type, volume, abv)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sky-300">Log a drink</h3>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DRINK_PRESETS.map((p, i) => (
          <button
            key={p.type}
            type="button"
            onClick={() => setSelected(i)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              selected === i
                ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
            }`}
          >
            {p.type}
          </button>
        ))}
      </div>

      {isCustom && (
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-slate-400">Name</span>
            <input
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Volume (ml)</span>
            <input
              type="number"
              min={1}
              value={customVolume}
              onChange={(e) => setCustomVolume(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">ABV %</span>
            <input
              type="number"
              min={0.1}
              max={100}
              step={0.1}
              value={customAbv}
              onChange={(e) => setCustomAbv(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-2 text-sm">
        <span className="text-slate-400">
          {volume}ml @ {abv}% ABV
        </span>
        <span className="text-slate-300">≈ {stdDrinks.toFixed(1)} standard drinks</span>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-xl bg-slate-700 py-3 font-medium transition hover:bg-slate-600"
      >
        + Add drink
      </button>
    </div>
  )
}
