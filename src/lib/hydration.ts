import type { DrinkEntry, HydrationEntry } from '../types'

export const GLASS_ML = 250
export const HYDRATION_REMINDER_MS = 45 * 60 * 1000
export const DRINKS_PER_WATER = 2

export function totalGlasses(hydration: HydrationEntry[]): number {
  return hydration.reduce((sum, h) => sum + h.glasses, 0)
}

export function drinksSinceLastWater(
  drinks: DrinkEntry[],
  hydration: HydrationEntry[],
): number {
  const lastWater =
    hydration.length > 0
      ? Math.max(...hydration.map((h) => h.timestamp))
      : 0
  return drinks.filter((d) => d.timestamp > lastWater).length
}

export function shouldRemindHydration(
  drinks: DrinkEntry[],
  hydration: HydrationEntry[],
  dismissedAt: number | undefined,
  now: number,
): boolean {
  if (drinks.length === 0) return false
  if (drinksSinceLastWater(drinks, hydration) < DRINKS_PER_WATER) return false
  if (dismissedAt && now - dismissedAt < HYDRATION_REMINDER_MS) return false
  return true
}

export function waterGlassesRecommended(drinkCount: number): number {
  if (drinkCount === 0) return 0
  return Math.max(1, Math.ceil(drinkCount / DRINKS_PER_WATER))
}

export function waterMlRecommended(drinkCount: number): number {
  return waterGlassesRecommended(drinkCount) * GLASS_ML
}

export function waterMlLogged(hydration: HydrationEntry[]): number {
  return totalGlasses(hydration) * GLASS_ML
}

export function waterMlRemaining(drinkCount: number, hydration: HydrationEntry[]): number {
  return Math.max(0, waterMlRecommended(drinkCount) - waterMlLogged(hydration))
}

export function glassesRemaining(drinkCount: number, hydration: HydrationEntry[]): number {
  return Math.ceil(waterMlRemaining(drinkCount, hydration) / GLASS_ML)
}
