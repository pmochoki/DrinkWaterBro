export type WeightUnit = 'kg' | 'lb'
export type VolumeUnit = 'ml' | 'oz'
export type BiologicalSex = 'male' | 'female'
export type Zone = 'sober' | 'buzzed' | 'impaired' | 'danger'

export interface UserProfile {
  weight: number
  weightUnit: WeightUnit
  heightCm: number
  age: number
  sex: BiologicalSex
  workTomorrow: boolean
  metabolismRate: number
}

export interface DrinkEntry {
  id: string
  name: string
  volumeMl: number
  abvPercent: number
  timestamp: number
}

export interface ActiveSession {
  id: string
  startedAt: number
  drinks: DrinkEntry[]
  fastDrinkingAlertDismissed?: boolean
}

export interface AppData {
  profile: UserProfile | null
  activeSession: ActiveSession | null
}

export interface QuickDrink {
  id: string
  name: string
  emoji: string
  volumeMl: number
  abvPercent: number
}

export interface ZoneInfo {
  zone: Zone
  label: string
  color: string
  min: number
  max: number
}
