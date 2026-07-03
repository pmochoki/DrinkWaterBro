import { getPartySnackTip } from '../lib/food'
import { FOOD_ABSORPTION } from '../lib/constants'
import type { FoodIntake } from '../types'

interface FoodTipsProps {
  foodIntake: FoodIntake
}

export function FoodTips({ foodIntake }: FoodTipsProps) {
  const profile = FOOD_ABSORPTION[foodIntake]
  const tip = getPartySnackTip(foodIntake)

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-surface-light/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{profile.emoji}</span>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Food · {profile.label}
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{tip}</p>
    </div>
  )
}
