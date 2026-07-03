import { WATER_AMOUNTS } from '../lib/drinks'

interface WaterLoggerProps {
  onAdd: (volumeMl: number) => void
  totalWaterMl: number
}

export function WaterLogger({ onAdd, totalWaterMl }: WaterLoggerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sky-300">Hydration 💧</h3>
          <p className="text-xs text-slate-400">Bro says drink some water</p>
        </div>
        <span className="text-sm text-sky-400">{totalWaterMl}ml logged</span>
      </div>

      <div className="flex gap-2">
        {WATER_AMOUNTS.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => onAdd(ml)}
            className="flex-1 rounded-lg border border-sky-600/50 bg-sky-600/10 py-2 text-sm text-sky-300 transition hover:bg-sky-600/20"
          >
            +{ml}ml
          </button>
        ))}
      </div>
    </div>
  )
}
