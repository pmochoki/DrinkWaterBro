import {
  GLASS_ML,
  DRINKS_PER_WATER,
  glassesRemaining,
  totalGlasses,
  waterGlassesRecommended,
  waterMlLogged,
  waterMlRecommended,
} from '../lib/hydration'
import type { DrinkEntry, HydrationEntry } from '../types'

interface HydrationTrackerProps {
  drinks: DrinkEntry[]
  hydration: HydrationEntry[]
  onLogGlass: () => void
}

function formatVolume(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1).replace(/\.0$/, '')} L`
  return `${ml} ml`
}

export function HydrationTracker({ drinks, hydration, onLogGlass }: HydrationTrackerProps) {
  const drinkCount = drinks.length
  const targetGlasses = waterGlassesRecommended(drinkCount)
  const loggedGlasses = totalGlasses(hydration)
  const remainingGlasses = glassesRemaining(drinkCount, hydration)
  const targetMl = waterMlRecommended(drinkCount)
  const loggedMl = waterMlLogged(hydration)
  const progress =
    targetGlasses > 0 ? Math.min(100, Math.round((loggedGlasses / targetGlasses) * 100)) : 0

  return (
    <section className="mx-4 mb-4 rounded-2xl bg-surface-light px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-water">Hydration</p>
          <p className="mt-1 text-lg font-bold text-white">
            {drinkCount === 0
              ? 'Water between drinks'
              : remainingGlasses > 0
                ? `${remainingGlasses} glass${remainingGlasses === 1 ? '' : 'es'} to go`
                : 'Hydration on track 💧'}
          </p>
        </div>
        <span className="text-2xl" aria-hidden>
          💧
        </span>
      </div>

      {drinkCount === 0 ? (
        <p className="mt-2 text-sm text-slate-400">
          Aim for 1 glass ({formatVolume(GLASS_ML)}) every {DRINKS_PER_WATER} drinks you log.
        </p>
      ) : (
        <>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-water transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <dt className="text-slate-500">Target</dt>
              <dd className="mt-0.5 font-semibold text-white">
                {targetGlasses} · {formatVolume(targetMl)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Logged</dt>
              <dd className="mt-0.5 font-semibold text-water">
                {loggedGlasses} · {formatVolume(loggedMl)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Still need</dt>
              <dd className="mt-0.5 font-semibold text-white">
                {remainingGlasses} · {formatVolume(targetMl - loggedMl)}
              </dd>
            </div>
          </dl>
        </>
      )}

      <button
        type="button"
        onClick={onLogGlass}
        className="mt-4 w-full rounded-xl bg-water/15 py-3 text-sm font-semibold text-water ring-1 ring-water/30 transition-transform active:scale-[0.98]"
      >
        + Log a glass ({formatVolume(GLASS_ML)})
      </button>
    </section>
  )
}
