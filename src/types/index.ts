export type WeightUnit = 'kg' | 'lb'
export type VolumeUnit = 'ml' | 'oz'
export type BiologicalSex = 'male' | 'female'
export type Zone = 'sober' | 'buzzed' | 'impaired' | 'danger'
export type FoodIntake = 'nothing' | 'snacks' | 'light_meal' | 'full_meal'
export type SessionGoal = 'couple' | 'buzzed' | 'full_night'

export interface UserProfile {
  weight: number
  weightUnit: WeightUnit
  heightCm: number
  age: number
  sex: BiologicalSex
  workTomorrow: boolean
  metabolismRate: number
  country?: string
  wakeTimeHour?: number
  wakeTimeMinute?: number
}

export interface DrinkEntry {
  id: string
  name: string
  volumeMl: number
  abvPercent: number
  timestamp: number
}

export interface HydrationEntry {
  id: string
  glasses: number
  timestamp: number
}

export interface SessionAlarms {
  wakeTime?: number
  stopDrinkingAt?: number
  hydrateBeforeBedAt?: number
  wakeUpAt?: number
}

export interface ActiveSession {
  id: string
  startedAt: number
  drinks: DrinkEntry[]
  foodIntake: FoodIntake
  goal: SessionGoal
  drinkLimit: number
  hydration: HydrationEntry[]
  alarms?: SessionAlarms
  fastDrinkingAlertDismissed?: boolean
  emptyStomachWarningDismissed?: boolean
  limitWarningDismissed?: boolean
  hydrationReminderDismissedAt?: number
}

export interface CompletedSession {
  id: string
  startedAt: number
  endedAt: number
  drinks: DrinkEntry[]
  foodIntake: FoodIntake
  goal: SessionGoal
  peakBac: number
  peakZone: Zone
  hydrationGlasses: number
  recoveryRating?: number
}

export interface AppData {
  profile: UserProfile | null
  activeSession: ActiveSession | null
  sessionHistory: CompletedSession[]
  patternFlagShownAt?: number
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
