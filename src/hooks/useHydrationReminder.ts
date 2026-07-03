import { useEffect, useRef, useState } from 'react'

const DEFAULT_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

export function useHydrationReminder(
  active: boolean,
  lastWaterAt: number | null,
  intervalMs: number = DEFAULT_INTERVAL_MS,
) {
  const [showReminder, setShowReminder] = useState(false)
  const [minutesSinceWater, setMinutesSinceWater] = useState(0)
  const dismissedRef = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      setShowReminder(false)
      return
    }

    const check = () => {
      const reference = lastWaterAt ?? Date.now()
      const elapsed = Date.now() - reference
      const minutes = Math.floor(elapsed / 60_000)
      setMinutesSinceWater(minutes)

      if (elapsed >= intervalMs && Date.now() - dismissedRef.current > intervalMs / 2) {
        setShowReminder(true)
      }
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [active, lastWaterAt, intervalMs])

  const dismiss = () => {
    setShowReminder(false)
    dismissedRef.current = Date.now()
  }

  return { showReminder, minutesSinceWater, dismiss }
}
