import { bacGaugePosition, getZone, timeToNextZoneDown } from '../lib/bac'
import { formatBAC, formatDuration } from '../lib/units'
import { ZONES } from '../lib/constants'
import type { UserProfile } from '../types'

interface ZoneGaugeProps {
  bac: number
  profile: UserProfile | null
}

export function ZoneGauge({ bac, profile }: ZoneGaugeProps) {
  const zone = getZone(bac)
  const position = bacGaugePosition(bac)
  const metabolismRate = profile?.metabolismRate ?? 0.015
  const nextZone = timeToNextZoneDown(bac, metabolismRate)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Zone label */}
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-slate-400">
          Current zone
        </p>
        <p
          className="mt-1 text-4xl font-black tracking-tight"
          style={{ color: zone.color }}
        >
          {zone.label}
        </p>
        <p className="mt-1 text-lg text-slate-300">
          est. BAC {formatBAC(bac)}
        </p>
      </div>

      {/* Gauge bar */}
      <div className="relative w-full">
        <div className="flex h-6 w-full overflow-hidden rounded-full">
          {ZONES.map((z) => (
            <div
              key={z.zone}
              className="flex-1"
              style={{ backgroundColor: z.color, opacity: 0.4 }}
            />
          ))}
        </div>
        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000"
          style={{ left: `calc(${position}% - 10px)` }}
        >
          <div
            className="h-8 w-5 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: zone.color }}
          />
        </div>
        {/* Zone labels */}
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          {ZONES.map((z) => (
            <span key={z.zone} className="text-center" style={{ width: '25%' }}>
              {z.label}
            </span>
          ))}
        </div>
      </div>

      {/* Time to next zone */}
      {nextZone && (
        <p className="text-center text-sm text-slate-400">
          {formatDuration(nextZone.ms)} to{' '}
          <span style={{ color: nextZone.zone.color }} className="font-medium">
            {nextZone.zone.label}
          </span>
        </p>
      )}

      {bac < 0.02 && (
        <p className="text-center text-sm text-sober">
          You're in the clear — stay hydrated 💧
        </p>
      )}

      {/* Disclaimer */}
      <p className="rounded-xl bg-surface-light/60 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
        Rough estimate only — not a medical or legal measurement. Many factors
        affect real BAC.
      </p>
    </div>
  )
}
