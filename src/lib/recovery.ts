import type { CompletedSession, UserProfile } from '../types'
import { waterGlassesRecommended } from './hydration'

export const BEFORE_SLEEP_TIPS = [
  'Drink water now — aim for at least 2–3 glasses before bed',
  'Eat something bland: toast, banana, or peanut butter on crackers',
  'Take a B-vitamin or multivitamin if you have one',
  'Skip the "hair of the dog" — it just delays the inevitable',
]

export const HANGOVER_FOODS = [
  { food: 'Eggs', why: 'Cysteine helps break down acetaldehyde' },
  { food: 'Bananas', why: 'Potassium your body lost overnight' },
  { food: 'Ginger tea', why: 'Eases nausea without irritating your stomach' },
  { food: 'Coconut water', why: 'Electrolytes without the sugar bomb' },
]

export const AVOID_TIPS = [
  'Hair of the dog — delays recovery, doesn\'t fix it',
  'Skipping breakfast — your blood sugar needs help',
  'Coffee on an empty stomach first thing — acid + empty belly = worse nausea',
  'Ibuprofen on an empty stomach — eat something first',
]

export const NAUSEA_STOMACH_TIP =
  'Morning nausea often comes from alcohol irritating your stomach lining — not just dehydration. Gentle foods, ginger tea, and electrolytes help calm it down.'

export function recoveryWaterGlasses(session: CompletedSession): number {
  return waterGlassesRecommended(session.drinks.length) + 1
}

export function morningBreakfastSuggestion(session: CompletedSession): string {
  if (session.drinks.length >= 5) {
    return 'Eggs + toast + coconut water. Your body needs protein, carbs, and electrolytes.'
  }
  if (session.drinks.length >= 3) {
    return 'Banana + peanut butter toast + ginger tea. Gentle on the stomach.'
  }
  return 'Light breakfast — eggs or yogurt with fruit. You probably just need hydration.'
}

export function stopDrinkingTime(
  profile: UserProfile,
  now: number = Date.now(),
): number | null {
  if (!profile.workTomorrow || profile.wakeTimeHour == null) return null

  const wake = new Date(now)
  wake.setDate(wake.getDate() + 1)
  wake.setHours(profile.wakeTimeHour, profile.wakeTimeMinute ?? 0, 0, 0)

  // 8 hours sleep + ~4 hours for BAC to clear from moderate drinking
  const hoursBeforeWake = 12
  return wake.getTime() - hoursBeforeWake * 60 * 60 * 1000
}

export function buildSessionAlarms(profile: UserProfile, now: number = Date.now()) {
  if (!profile.workTomorrow || profile.wakeTimeHour == null) return undefined

  const wake = new Date(now)
  wake.setDate(wake.getDate() + 1)
  wake.setHours(profile.wakeTimeHour, profile.wakeTimeMinute ?? 0, 0, 0)
  const wakeMs = wake.getTime()

  const stopDrinkingAt = stopDrinkingTime(profile, now) ?? wakeMs - 12 * 60 * 60 * 1000
  const hydrateBeforeBedAt = wakeMs - 9 * 60 * 60 * 1000

  return {
    wakeTime: wakeMs,
    stopDrinkingAt,
    hydrateBeforeBedAt,
    wakeUpAt: wakeMs,
  }
}
