import type { QuickDrink, ZoneInfo } from '../types'

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
