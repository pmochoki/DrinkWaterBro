import { STORAGE_KEY } from './constants'
import type { AppData } from '../types'

const DEFAULT_DATA: AppData = {
  profile: null,
  activeSession: null,
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA }
    const parsed = JSON.parse(raw) as AppData
    return {
      profile: parsed.profile ?? null,
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
