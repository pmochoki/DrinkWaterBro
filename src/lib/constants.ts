import type { FoodIntake, QuickDrink, SessionGoal, ZoneInfo } from '../types'

export const GOAL_OPTIONS: { value: SessionGoal; label: string; emoji: string; limit: number; hint: string }[] = [
  { value: 'couple', label: 'Just a couple', emoji: '🍻', limit: 2, hint: 'Keeping it light tonight' },
  { value: 'buzzed', label: 'Get buzzed', emoji: '😊', limit: 4, hint: 'A fun night, staying aware' },
  { value: 'full_night', label: 'Full night out', emoji: '🎉', limit: 8, hint: 'Long night — we\'ll keep you honest' },
]

export const STORAGE_KEY = 'drinkwaterbro-data'

export const DEFAULT_METABOLISM_RATE = 0.015

export const WIDMARK_R = {
  male: 0.68,
  female: 0.55,
} as const

export const ZONES: ZoneInfo[] = [
  { zone: 'sober', label: 'Sober', color: '#22c55e', min: 0, max: 0.02 },
  { zone: 'buzzed', label: 'Buzzed', color: '#eab308', min: 0.02, max: 0.05 },
  { zone: 'impaired', label: 'Impaired', color: '#f97316', min: 0.05, max: 0.08 },
  { zone: 'danger', label: 'Danger', color: '#ef4444', min: 0.08, max: 0.4 },
]

export const QUICK_DRINKS: QuickDrink[] = [
  { id: 'beer', name: 'Beer', emoji: '🍺', volumeMl: 355, abvPercent: 5 },
  { id: 'wine', name: 'Wine', emoji: '🍷', volumeMl: 150, abvPercent: 12 },
  { id: 'vodka', name: 'Vodka Shot', emoji: '🥃', volumeMl: 44, abvPercent: 40 },
  { id: 'martini', name: 'Martini', emoji: '🍸', volumeMl: 150, abvPercent: 30 },
  { id: 'mimosa', name: 'Mimosa', emoji: '🥂', volumeMl: 150, abvPercent: 8 },
  { id: 'whiskey', name: 'Whiskey', emoji: '🥃', volumeMl: 44, abvPercent: 40 },
  { id: 'champagne', name: 'Champagne', emoji: '🍾', volumeMl: 150, abvPercent: 12 },
]

export const ETHANOL_DENSITY = 0.789 // g/ml

/** Fast drinking: 3+ drinks within this window (ms) */
export const FAST_DRINK_WINDOW_MS = 45 * 60 * 1000
export const FAST_DRINK_THRESHOLD = 3

export interface FoodAbsorptionProfile {
  peakMultiplier: number
  rampUpMinutes: number
  label: string
  emoji: string
}

export const FOOD_ABSORPTION: Record<FoodIntake, FoodAbsorptionProfile> = {
  nothing: { peakMultiplier: 1.3, rampUpMinutes: 15, label: 'Nothing', emoji: '🫗' },
  snacks: { peakMultiplier: 1.1, rampUpMinutes: 30, label: 'Snacks only', emoji: '🥨' },
  light_meal: { peakMultiplier: 0.85, rampUpMinutes: 50, label: 'Light meal', emoji: '🥗' },
  full_meal: { peakMultiplier: 0.7, rampUpMinutes: 75, label: 'Full meal', emoji: '🍽️' },
}

export const FOOD_INTAKE_OPTIONS = (
  Object.entries(FOOD_ABSORPTION) as [FoodIntake, FoodAbsorptionProfile][]
).map(([value, profile]) => ({ value, ...profile }))
