import { FOOD_PRESETS } from '../lib/drinks'
import type { FoodLevel } from '../types'

interface FoodLoggerProps {
  onAdd: (description: string, level: FoodLevel) => void
}

export function FoodLogger({ onAdd }: FoodLoggerProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-sky-300">Log food</h3>
        <p className="text-xs text-slate-400">Food slows alcohol absorption</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FOOD_PRESETS.map((preset) => (
          <button
            key={preset.description}
            type="button"
            onClick={() => onAdd(preset.description, preset.level)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm transition hover:border-slate-500"
          >
            {preset.description}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onAdd('Empty stomach', 'empty')}
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-400 transition hover:border-slate-500"
        >
          Empty stomach
        </button>
      </div>
    </div>
  )
}
