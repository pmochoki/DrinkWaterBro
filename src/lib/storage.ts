import { STORAGE_KEY } from './constants'
import type { AppData, UserProfile } from '../types'

const DEFAULT_DATA: AppData = {
  profile: null,
  activeSession: null,
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
  }
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA }
    const parsed = JSON.parse(raw) as AppData
    return {
      profile: migrateProfile(parsed.profile as unknown as Record<string, unknown>),
      activeSession: parsed.activeSession ?? null,
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
