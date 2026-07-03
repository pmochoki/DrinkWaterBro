import { useCallback, useEffect, useState } from 'react'
import type { DrinkEntry, FoodEntry, Session, SessionSummary, UserProfile, WaterEntry } from '../types'
import {
  generateId,
  loadActiveSession,
  loadProfile,
  loadSessionHistory,
  saveProfile,
  saveSession,
} from '../lib/db'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [history, setHistory] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [p, s, h] = await Promise.all([loadProfile(), loadActiveSession(), loadSessionHistory()])
    setProfile(p)
    setSession(s)
    setHistory(h)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateProfile = useCallback(async (p: UserProfile) => {
    await saveProfile(p)
    setProfile(p)
  }, [])

  const startSession = useCallback(
    async (personalLimitPercent: number) => {
      if (!profile) return
      const newSession: Session = {
        id: generateId(),
        startedAt: Date.now(),
        endedAt: null,
        profile,
        personalLimitPercent,
        drinks: [],
        food: [],
        water: [],
      }
      await saveSession(newSession)
      setSession(newSession)
    },
    [profile],
  )

  const endSession = useCallback(async () => {
    if (!session) return
    const ended: Session = { ...session, endedAt: Date.now() }
    await saveSession(ended)
    setSession(null)
    const h = await loadSessionHistory()
    setHistory(h)
  }, [session])

  const persistSession = useCallback(async (updated: Session) => {
    await saveSession(updated)
    setSession(updated)
  }, [])

  const addDrink = useCallback(
    async (type: string, volumeMl: number, abvPercent: number) => {
      if (!session) return
      const drink: DrinkEntry = {
        id: generateId(),
        type,
        volumeMl,
        abvPercent,
        timestamp: Date.now(),
      }
      await persistSession({ ...session, drinks: [...session.drinks, drink] })
    },
    [session, persistSession],
  )

  const addFood = useCallback(
    async (description: string, level: FoodEntry['level']) => {
      if (!session) return
      const entry: FoodEntry = {
        id: generateId(),
        description,
        level,
        timestamp: Date.now(),
      }
      await persistSession({ ...session, food: [...session.food, entry] })
    },
    [session, persistSession],
  )

  const addWater = useCallback(
    async (volumeMl: number) => {
      if (!session) return
      const entry: WaterEntry = {
        id: generateId(),
        volumeMl,
        timestamp: Date.now(),
      }
      await persistSession({ ...session, water: [...session.water, entry] })
    },
    [session, persistSession],
  )

  return {
    session,
    profile,
    history,
    loading,
    updateProfile,
    startSession,
    endSession,
    addDrink,
    addFood,
    addWater,
    refresh,
  }
}
