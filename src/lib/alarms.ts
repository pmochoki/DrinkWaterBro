import type { SessionAlarms } from '../types'

const ALARMS_STORAGE_KEY = 'drinkwaterbro_alarms'

interface StoredAlarm {
  id: string
  at: number
  title: string
  body: string
}

const activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function loadStoredAlarms(): StoredAlarm[] {
  try {
    const raw = localStorage.getItem(ALARMS_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredAlarm[]
  } catch {
    return []
  }
}

function saveStoredAlarms(alarms: StoredAlarm[]): void {
  localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms))
}

function fireNotification(alarm: StoredAlarm): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(alarm.title, { body: alarm.body, icon: '/favicon.svg' })
}

function scheduleAlarm(alarm: StoredAlarm): void {
  const delay = alarm.at - Date.now()
  if (delay <= 0) return
  if (delay > 48 * 60 * 60 * 1000) return

  const existing = activeTimeouts.get(alarm.id)
  if (existing) clearTimeout(existing)

  const timeout = setTimeout(() => {
    fireNotification(alarm)
    activeTimeouts.delete(alarm.id)
    const remaining = loadStoredAlarms().filter((a) => a.id !== alarm.id)
    saveStoredAlarms(remaining)
  }, delay)

  activeTimeouts.set(alarm.id, timeout)
}

export function reschedulePendingAlarms(): void {
  const now = Date.now()
  const pending = loadStoredAlarms().filter((a) => a.at > now)
  saveStoredAlarms(pending)
  for (const alarm of pending) {
    scheduleAlarm(alarm)
  }
}

function upsertAlarms(newAlarms: StoredAlarm[]): void {
  const now = Date.now()
  const existing = loadStoredAlarms().filter((a) => a.at > now)
  const merged = [...existing]

  for (const alarm of newAlarms) {
    if (alarm.at <= now) continue
    const idx = merged.findIndex((a) => a.id === alarm.id)
    if (idx >= 0) merged[idx] = alarm
    else merged.push(alarm)
  }

  saveStoredAlarms(merged)
  for (const alarm of merged) {
    scheduleAlarm(alarm)
  }
}

export async function scheduleSessionAlarms(
  alarms: SessionAlarms,
  options?: { morningBreakfast?: string },
): Promise<boolean> {
  const granted = await requestNotificationPermission()
  if (!granted) return false

  const now = Date.now()
  const toSchedule: StoredAlarm[] = []

  if (alarms.stopDrinkingAt && alarms.stopDrinkingAt > now) {
    toSchedule.push({
      id: 'stop-drinking',
      at: alarms.stopDrinkingAt,
      title: 'Time to wind down 🌙',
      body: "You've got work tomorrow — slowing down now gives your body time to recover.",
    })
  }

  if (alarms.hydrateBeforeBedAt && alarms.hydrateBeforeBedAt > now) {
    toSchedule.push({
      id: 'hydrate-bed',
      at: alarms.hydrateBeforeBedAt,
      title: 'Water + snack time 💧',
      body: 'Drink 2–3 glasses of water and eat something before bed. Future you will thank you.',
    })
  }

  if (alarms.wakeUpAt && alarms.wakeUpAt > now) {
    const breakfast =
      options?.morningBreakfast ??
      'Grab water first, then eggs or toast — skip coffee on an empty stomach.'
    toSchedule.push({
      id: 'morning-wake',
      at: alarms.wakeUpAt,
      title: 'Morning check-in ☀️',
      body: `How are you feeling? ${breakfast}`,
    })
  }

  upsertAlarms(toSchedule)
  return true
}

export async function scheduleMorningAlarm(
  wakeUpAt: number,
  breakfastMessage: string,
): Promise<boolean> {
  const granted = await requestNotificationPermission()
  if (!granted) return false

  upsertAlarms([
    {
      id: 'morning-wake',
      at: wakeUpAt,
      title: 'Morning check-in ☀️',
      body: `How are you feeling? ${breakfastMessage}`,
    },
  ])
  return true
}
