import { useCallback, useEffect, useState } from 'react'
import type { AppData, UserProfile, ActiveSession, DrinkEntry } from '../types'
import { loadAppData, saveAppData, generateId } from '../lib/storage'

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadAppData())

  useEffect(() => {
    saveAppData(data)
  }, [data])

  const setProfile = useCallback((profile: UserProfile) => {
    setData((prev) => ({ ...prev, profile }))
  }, [])

  const startSession = useCallback(() => {
    const session: ActiveSession = {
      id: generateId(),
      startedAt: Date.now(),
      drinks: [],
    }
    setData((prev) => ({ ...prev, activeSession: session }))
    return session
  }, [])

  const endSession = useCallback(() => {
    setData((prev) => ({ ...prev, activeSession: null }))
  }, [])

  const addDrink = useCallback((drink: Omit<DrinkEntry, 'id'>) => {
    const entry: DrinkEntry = { ...drink, id: generateId() }
    setData((prev) => {
      if (!prev.activeSession) {
        const session: ActiveSession = {
          id: generateId(),
          startedAt: Date.now(),
          drinks: [entry],
        }
        return { ...prev, activeSession: session }
      }
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          drinks: [...prev.activeSession.drinks, entry],
        },
      }
    })
    return entry
  }, [])

  const updateDrink = useCallback((id: string, updates: Partial<DrinkEntry>) => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          drinks: prev.activeSession.drinks.map((d) =>
            d.id === id ? { ...d, ...updates } : d,
          ),
        },
      }
    })
  }, [])

  const deleteDrink = useCallback((id: string) => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          drinks: prev.activeSession.drinks.filter((d) => d.id !== id),
        },
      }
    })
  }, [])

  return {
    data,
    profile: data.profile,
    activeSession: data.activeSession,
    setProfile,
    startSession,
    endSession,
    addDrink,
    updateDrink,
    deleteDrink,
  }
}
