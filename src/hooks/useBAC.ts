import { useEffect, useState } from 'react'
import type { DrinkEntry, FoodEntry, UserProfile } from '../types'
import { calculateBAC, getZone } from '../lib/bac'

export function useBAC(
  profile: UserProfile | null,
  drinks: DrinkEntry[],
  food: FoodEntry[],
  personalLimitPercent: number,
) {
  const [bac, setBac] = useState(0)
  const [zone, setZone] = useState(getZone(0))

  useEffect(() => {
    if (!profile) {
      setBac(0)
      setZone(getZone(0))
      return
    }

    const update = () => {
      const current = calculateBAC(profile, drinks, food)
      setBac(current)
      setZone(getZone(current))
    }

    update()
    const interval = setInterval(update, 30_000)
    return () => clearInterval(interval)
  }, [profile, drinks, food])

  const limitReached = bac >= personalLimitPercent
  const limitApproaching = !limitReached && bac >= personalLimitPercent * 0.8

  return { bac, zone, limitReached, limitApproaching }
}
