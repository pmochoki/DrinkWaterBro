import { useState } from 'react'

interface LimitSetterProps {
  onStart: (limitPercent: number) => void
}

const PRESETS = [
  { label: 'Light (0.03%)', value: 0.03 },
  { label: 'Moderate (0.05%)', value: 0.05 },
  { label: 'Cautious (0.08%)', value: 0.08 },
]

export function LimitSetter({ onStart }: LimitSetterProps) {
  const [limit, setLimit] = useState(0.05)
  const [custom, setCustom] = useState(false)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-sky-300">Set your limit</h2>
        <p className="mt-1 text-sm text-slate-400">
          Decide your personal ceiling <em>before</em> you start. This app won't tell you how much
          more you can drink — only where you're at.
        </p>
      </div>

      <div className="space-y-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => {
              setLimit(preset.value)
              setCustom(false)
            }}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              !custom && limit === preset.value
                ? 'border-sky-500 bg-sky-500/20'
                : 'border-slate-600 bg-slate-800 hover:border-slate-500'
            }`}
          >
            <span className="font-medium">{preset.label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setCustom(true)}
          className={`w-full rounded-xl border px-4 py-3 text-left transition ${
            custom ? 'border-sky-500 bg-sky-500/20' : 'border-slate-600 bg-slate-800 hover:border-slate-500'
          }`}
        >
          Custom limit
        </button>

        {custom && (
          <label className="block">
            <span className="text-sm text-slate-400">BAC limit (%)</span>
            <input
              type="number"
              min={0.01}
              max={0.2}
              step={0.01}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            />
          </label>
        )}
      </div>

      <button
        type="button"
        onClick={() => onStart(limit)}
        className="w-full rounded-xl bg-sky-600 py-3 font-medium text-white transition hover:bg-sky-500"
      >
        Start session
      </button>
    </div>
  )
}
