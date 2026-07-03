import { STORAGE_KEY } from './constants'
import type { ActiveSession, AppData, CompletedSession, UserProfile } from '../types'

const DEFAULT_DATA: AppData = {
  profile: null,
  activeSession: null,
  sessionHistory: [],
}

function migrateProfile(raw: Record<string, unknown>): UserProfile | null {
  if (!raw) return null
  const p = raw as Partial<UserProfile> & { eatingHabit?: string }
  if (!p.weight || !p.sex) return null
  return {
    weight: p.weight,
    weightUnit: p.weightUnit ?? 'kg',
    heightCm: p.heightCm ?? 170,
    age: p.age ?? 25,
    sex: p.sex,
    workTomorrow: p.workTomorrow ?? false,
    metabolismRate: p.metabolismRate ?? 0.015,
    country: p.country,
    wakeTimeHour: p.wakeTimeHour,
    wakeTimeMinute: p.wakeTimeMinute,
  }
}

function migrateSession(raw: Record<string, unknown> | null): ActiveSession | null {
  if (!raw || !raw.foodIntake) return null
  const s = raw as Partial<ActiveSession>
  return {
    id: s.id ?? `${Date.now()}`,
    startedAt: s.startedAt ?? Date.now(),
    drinks: s.drinks ?? [],
    foodIntake: s.foodIntake as ActiveSession['foodIntake'],
    goal: s.goal ?? 'buzzed',
    drinkLimit: s.drinkLimit ?? 4,
    hydration: s.hydration ?? [],
    alarms: s.alarms,
    fastDrinkingAlertDismissed: s.fastDrinkingAlertDismissed,
    emptyStomachWarningDismissed: s.emptyStomachWarningDismissed,
    limitWarningDismissed: s.limitWarningDismissed,
    hydrationReminderDismissedAt: s.hydrationReminderDismissedAt,
  }
}

function migrateHistory(raw: unknown): CompletedSession[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((s) => s && s.id && s.endedAt) as CompletedSession[]
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA }
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      profile: migrateProfile(parsed.profile as unknown as Record<string, unknown>),
      activeSession: migrateSession(parsed.activeSession as unknown as Record<string, unknown>),
      sessionHistory: migrateHistory(parsed.sessionHistory),
      patternFlagShownAt: parsed.patternFlagShownAt,
    }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
