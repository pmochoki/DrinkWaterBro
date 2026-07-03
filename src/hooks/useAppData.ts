import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppData, UserProfile, ActiveSession, DrinkEntry, FoodIntake } from '../types'
import { loadAppData, saveAppData, generateId } from '../lib/storage'
import { loadFirestoreAppData, saveFirestoreAppData } from '../lib/firestoreStorage'

interface UseAppDataOptions {
  uid?: string | null
  cloudReady?: boolean
}

export function useAppData({ uid, cloudReady = false }: UseAppDataOptions = {}) {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const hydratedFromCloud = useRef(false)
  const skipNextSave = useRef(false)

  useEffect(() => {
    if (!cloudReady || !uid) {
      hydratedFromCloud.current = false
      return
    }

    let cancelled = false
    setSyncing(true)
    setSyncError(null)

    loadFirestoreAppData(uid)
      .then((cloudData) => {
        if (cancelled) return
        skipNextSave.current = true
        setData((local) => {
          const hasLocal = local.profile != null || local.activeSession != null
          const hasCloud = cloudData.profile != null || cloudData.activeSession != null
          if (!hasCloud && hasLocal) return local
          return cloudData
        })
        hydratedFromCloud.current = true
      })
      .catch((err: Error) => {
        if (!cancelled) setSyncError(err.message)
      })
      .finally(() => {
        if (!cancelled) setSyncing(false)
      })

    return () => {
      cancelled = true
    }
  }, [cloudReady, uid])

  useEffect(() => {
    saveAppData(data)

    if (!cloudReady || !uid || !hydratedFromCloud.current) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    saveFirestoreAppData(uid, data).catch((err: Error) => {
      setSyncError(err.message)
    })
  }, [data, cloudReady, uid])

  const setProfile = useCallback((profile: UserProfile) => {
    setData((prev) => ({ ...prev, profile }))
  }, [])

  const startSession = useCallback((foodIntake: FoodIntake) => {
    const session: ActiveSession = {
      id: generateId(),
      startedAt: Date.now(),
      drinks: [],
      foodIntake,
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
      if (!prev.activeSession) return prev

      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          drinks: [...prev.activeSession.drinks, entry],
        },
      }
    })

    return { entry }
  }, [])

  const dismissFastDrinkingAlert = useCallback(() => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          fastDrinkingAlertDismissed: true,
        },
      }
    })
  }, [])

  const dismissEmptyStomachWarning = useCallback(() => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          emptyStomachWarningDismissed: true,
        },
      }
    })
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
    syncing,
    syncError,
    setProfile,
    startSession,
    endSession,
    addDrink,
    updateDrink,
    deleteDrink,
    dismissFastDrinkingAlert,
    dismissEmptyStomachWarning,
  }
}
