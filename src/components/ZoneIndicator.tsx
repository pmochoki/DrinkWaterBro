import type { Zone } from '../types'
import { ZONE_CONFIG, formatBAC } from '../lib/bac'

interface ZoneIndicatorProps {
  zone: Zone
  bac: number
  personalLimit: number
  limitReached: boolean
  limitApproaching: boolean
}

export function ZoneIndicator({
  zone,
  bac,
  personalLimit,
  limitReached,
  limitApproaching,
}: ZoneIndicatorProps) {
  const config = ZONE_CONFIG[zone]

  return (
    <div className={`rounded-2xl border p-6 ${config.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-slate-400">Current zone</p>
          <h2 className={`mt-1 text-3xl font-bold ${config.color}`}>{config.label}</h2>
          <p className="mt-2 text-sm text-slate-300">{config.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Est. BAC</p>
          <p className={`text-2xl font-mono font-semibold ${config.color}`}>
            {formatBAC(bac)}%
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Your limit: {personalLimit.toFixed(2)}%</span>
          <span>{limitReached ? 'Limit reached' : limitApproaching ? 'Approaching limit' : ''}</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full transition-all duration-500 ${
              limitReached ? 'bg-danger' : limitApproaching ? 'bg-impaired' : 'bg-sky-500'
            }`}
            style={{ width: `${Math.min(100, (bac / personalLimit) * 100)}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Estimates only — not a breathalyzer. When in doubt, don't drive.
      </p>
    </div>
  )
}
