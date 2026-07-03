import type { DrinkEntry, FoodEntry, FoodLevel, Sex, UserProfile, Zone } from '../types'

const ETHANOL_DENSITY = 0.789 // g/ml
const ELIMINATION_RATE = 0.015 // % BAC per hour
const DISTRIBUTION_RATIO: Record<Sex, number> = { male: 0.68, female: 0.55 }

const FOOD_ABSORPTION: Record<FoodLevel, number> = {
  empty: 1.0,
  light: 0.85,
  full: 0.7,
}

export function alcoholGrams(volumeMl: number, abvPercent: number): number {
  return volumeMl * (abvPercent / 100) * ETHANOL_DENSITY
}

export function getFoodAbsorptionFactor(food: FoodEntry[], drinkTime: number): number {
  const relevant = food
    .filter((f) => f.timestamp <= drinkTime)
    .sort((a, b) => b.timestamp - a.timestamp)

  if (relevant.length === 0) return FOOD_ABSORPTION.empty
  return FOOD_ABSORPTION[relevant[0].level]
}

export function drinkAlcoholGrams(drink: DrinkEntry, food: FoodEntry[]): number {
  const base = alcoholGrams(drink.volumeMl, drink.abvPercent)
  const factor = getFoodAbsorptionFactor(food, drink.timestamp)
  return base * factor
}

export function calculateBAC(
  profile: UserProfile,
  drinks: DrinkEntry[],
  food: FoodEntry[],
  atTime: number = Date.now(),
): number {
  if (drinks.length === 0) return 0

  const r = DISTRIBUTION_RATIO[profile.sex]
  const weightGrams = profile.weightKg * 1000

  let totalBac = 0

  for (const drink of drinks) {
    if (drink.timestamp > atTime) continue

    const grams = drinkAlcoholGrams(drink, food)
    const hoursSinceDrink = (atTime - drink.timestamp) / (1000 * 60 * 60)
    const drinkBac = grams / (weightGrams * r)
    const eliminated = ELIMINATION_RATE * hoursSinceDrink
    totalBac += Math.max(0, drinkBac - eliminated)
  }

  return Math.max(0, totalBac)
}

export function getZone(bacPercent: number): Zone {
  if (bacPercent < 0.02) return 'sober'
  if (bacPercent < 0.05) return 'buzzed'
  if (bacPercent < 0.08) return 'impaired'
  return 'danger'
}

export const ZONE_CONFIG: Record<
  Zone,
  { label: string; color: string; bg: string; description: string }
> = {
  sober: {
    label: 'Sober',
    color: 'text-sober',
    bg: 'bg-sober/20 border-sober/40',
    description: "You're clear. Stay hydrated.",
  },
  buzzed: {
    label: 'Buzzed',
    color: 'text-buzzed',
    bg: 'bg-buzzed/20 border-buzzed/40',
    description: 'Feeling it a little. Pace yourself.',
  },
  impaired: {
    label: 'Impaired',
    color: 'text-impaired',
    bg: 'bg-impaired/20 border-impaired/40',
    description: 'Judgment and reflexes are affected. Slow down.',
  },
  danger: {
    label: 'Danger',
    color: 'text-danger',
    bg: 'bg-danger/20 border-danger/40',
    description: 'High risk zone. Stop drinking and get water.',
  },
}

export function formatBAC(bac: number): string {
  return bac.toFixed(3)
}

export function standardDrinks(volumeMl: number, abvPercent: number): number {
  const grams = alcoholGrams(volumeMl, abvPercent)
  return grams / 14 // US standard drink ≈ 14g ethanol
}
