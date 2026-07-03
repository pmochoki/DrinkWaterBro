import { DEFAULT_METABOLISM_RATE, ETHANOL_DENSITY, FOOD_ABSORPTION, WIDMARK_R, ZONES } from './constants'
import { lbToKg } from './units'
import type { DrinkEntry, FoodIntake, UserProfile, Zone, ZoneInfo } from '../types'

function weightToKg(weight: number, unit: 'kg' | 'lb'): number {
  return unit === 'kg' ? weight : lbToKg(weight)
}

export function alcoholGrams(volumeMl: number, abvPercent: number): number {
  return volumeMl * (abvPercent / 100) * ETHANOL_DENSITY
}

/** Peak BAC from a single drink using Widmark, adjusted for food absorption */
export function calculateDrinkPeakBAC(
  drink: DrinkEntry,
  profile: UserProfile,
  foodIntake: FoodIntake | null = null,
): number {
  const grams = alcoholGrams(drink.volumeMl, drink.abvPercent)
  const weightKg = weightToKg(profile.weight, profile.weightUnit)
  const r = WIDMARK_R[profile.sex]
  const basePeak = grams / (weightKg * r * 10)
  const { peakMultiplier } = FOOD_ABSORPTION[foodIntake ?? 'snacks']
  return basePeak * peakMultiplier
}

function drinkBACContribution(
  drink: DrinkEntry,
  profile: UserProfile,
  atTime: number,
  foodIntake: FoodIntake | null,
  metabolismRate: number,
): number {
  const peakBAC = calculateDrinkPeakBAC(drink, profile, foodIntake)
  const { rampUpMinutes } = FOOD_ABSORPTION[foodIntake ?? 'snacks']
  const rampUpHours = rampUpMinutes / 60
  const hoursSince = (atTime - drink.timestamp) / (1000 * 60 * 60)

  if (hoursSince < rampUpHours) {
    return peakBAC * (hoursSince / rampUpHours)
  }

  const hoursAtPeak = hoursSince - rampUpHours
  return Math.max(0, peakBAC - metabolismRate * hoursAtPeak)
}

export function calculateBAC(
  drinks: DrinkEntry[],
  profile: UserProfile,
  atTime: number = Date.now(),
  foodIntake: FoodIntake | null = null,
): number {
  const metabolismRate = profile.metabolismRate ?? DEFAULT_METABOLISM_RATE

  let totalBAC = 0
  for (const drink of drinks) {
    totalBAC += drinkBACContribution(drink, profile, atTime, foodIntake, metabolismRate)
  }

  return Math.max(0, totalBAC)
}

export function getZone(bac: number): ZoneInfo {
  if (bac < 0.02) return ZONES[0]
  if (bac < 0.05) return ZONES[1]
  if (bac < 0.08) return ZONES[2]
  return ZONES[3]
}

export function getZoneLabel(zone: Zone): string {
  return ZONES.find((z) => z.zone === zone)?.label ?? 'Unknown'
}

export function getNextZoneDown(bac: number): ZoneInfo | null {
  const current = getZone(bac)
  const idx = ZONES.findIndex((z) => z.zone === current.zone)
  if (idx <= 0) return null
  return ZONES[idx - 1]
}

export function timeToReachBAC(
  currentBAC: number,
  targetBAC: number,
  metabolismRate: number = DEFAULT_METABOLISM_RATE,
): number | null {
  if (currentBAC <= targetBAC) return null
  const hours = (currentBAC - targetBAC) / metabolismRate
  return hours * 60 * 60 * 1000
}

export function timeToNextZoneDown(
  bac: number,
  metabolismRate: number = DEFAULT_METABOLISM_RATE,
): { zone: ZoneInfo; ms: number } | null {
  const nextZone = getNextZoneDown(bac)
  if (!nextZone) return null
  const ms = timeToReachBAC(bac, nextZone.max, metabolismRate)
  if (ms === null) return null
  return { zone: nextZone, ms }
}

export function bacGaugePosition(bac: number): number {
  const maxDisplay = 0.16
  return Math.min(100, (bac / maxDisplay) * 100)
}
