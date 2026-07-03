import type { SessionAlarms } from '../types'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleSessionAlarms(alarms: SessionAlarms): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const now = Date.now()

  if (alarms.stopDrinkingAt && alarms.stopDrinkingAt > now) {
    scheduleNotification(
      alarms.stopDrinkingAt,
      'Time to wind down 🌙',
      "You've got work tomorrow — slowing down now gives your body time to recover.",
    )
  }

  if (alarms.hydrateBeforeBedAt && alarms.hydrateBeforeBedAt > now) {
    scheduleNotification(
      alarms.hydrateBeforeBedAt,
      'Water + snack time 💧',
      'Drink 2–3 glasses of water and eat something before bed. Future you will thank you.',
    )
  }

  if (alarms.wakeUpAt && alarms.wakeUpAt > now) {
    scheduleNotification(
      alarms.wakeUpAt,
      'Morning check-in ☀️',
      "How are you feeling? Grab water first, then eggs or toast — skip coffee on an empty stomach.",
    )
  }
}

function scheduleNotification(at: number, title: string, body: string): void {
  const delay = at - Date.now()
  if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return
  setTimeout(() => {
    new Notification(title, { body, icon: '/favicon.svg' })
  }, delay)
}
