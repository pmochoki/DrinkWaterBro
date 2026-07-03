import { useEffect, useState } from 'react'
import { calculateBAC } from '../lib/bac'
import type { DrinkEntry, UserProfile } from '../types'

const TICK_MS = 60_000

export function useLiveBAC(drinks: DrinkEntry[], profile: UserProfile | null) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(interval)
  }, [])

  if (!profile || drinks.length === 0) {
    return { bac: 0, now }
  }

  const bac = calculateBAC(drinks, profile, now)
  return { bac, now }
}
