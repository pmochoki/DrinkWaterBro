import { FOOD_INTAKE_OPTIONS } from '../lib/constants'
import { PRE_DRINK_FOODS } from '../lib/food'
import type { FoodIntake } from '../types'

interface FoodCheckInProps {
  onSelect: (foodIntake: FoodIntake) => void
  onBack?: () => void
}

export function FoodCheckIn({ onSelect, onBack }: FoodCheckInProps) {
  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 py-8">
      {onBack && (
        <button onClick={onBack} className="mb-4 text-sm text-water">
          ← Back
        </button>
      )}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-white">Before we start</h2>
        <p className="mt-2 text-slate-400">
          What have you eaten in the last 3 hours?
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FOOD_INTAKE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="flex items-center gap-4 rounded-2xl bg-surface-light px-5 py-4 text-left transition-transform active:scale-[0.98]"
          >
            <span className="text-3xl">{option.emoji}</span>
            <div>
              <p className="font-semibold text-white">{option.label}</p>
              {option.value === 'nothing' && (
                <p className="text-xs text-amber-400/80">
                  Alcohol hits harder on an empty stomach
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-surface-light/50 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Easy pre-drink foods
        </p>
        <ul className="mt-2 space-y-1 text-sm text-slate-400">
          {PRE_DRINK_FOODS.map((food) => (
            <li key={food}>· {food}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
