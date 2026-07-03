export type Sex = 'male' | 'female'

export type Zone = 'sober' | 'buzzed' | 'impaired' | 'danger'

export type FoodLevel = 'empty' | 'light' | 'full'

export interface UserProfile {
  weightKg: number
  heightCm: number
  age: number
  sex: Sex
}

export interface DrinkEntry {
  id: string
  type: string
  volumeMl: number
  abvPercent: number
  timestamp: number
}

export interface FoodEntry {
  id: string
  description: string
  level: FoodLevel
  timestamp: number
}

export interface WaterEntry {
  id: string
  volumeMl: number
  timestamp: number
}

export interface Session {
  id: string
  startedAt: number
  endedAt: number | null
  profile: UserProfile
  personalLimitPercent: number
  drinks: DrinkEntry[]
  food: FoodEntry[]
  water: WaterEntry[]
}

export interface SessionSummary {
  id: string
  startedAt: number
  endedAt: number
  drinkCount: number
  peakBacPercent: number
  peakZone: Zone
  personalLimitPercent: number
  limitReached: boolean
}