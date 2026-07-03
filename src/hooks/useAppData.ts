import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AppData,
  UserProfile,
  ActiveSession,
  DrinkEntry,
  FoodIntake,
  SessionGoal,
  CompletedSession,
} from '../types'
import { loadAppData, saveAppData, generateId } from '../lib/storage'
import { loadFirestoreAppData, saveFirestoreAppData, saveCompletedSession } from '../lib/firestoreStorage'
import { calculateBAC, getZone } from '../lib/bac'
import { totalGlasses } from '../lib/hydration'
import { buildSessionAlarms, morningBreakfastSuggestion } from '../lib/recovery'
import { requestNotificationPermission, scheduleMorningAlarm, scheduleSessionAlarms } from '../lib/alarms'

interface UseAppDataOptions {
  uid?: string | null
  cloudReady?: boolean
}

export function useAppData({ uid, cloudReady = false }: UseAppDataOptions = {}) {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastCompletedSession, setLastCompletedSession] = useState<CompletedSession | null>(null)
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
          const hasLocal =
            local.profile != null ||
            local.activeSession != null ||
            local.sessionHistory.length > 0
          const hasCloud =
            cloudData.profile != null ||
            cloudData.activeSession != null ||
            cloudData.sessionHistory.length > 0
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

  const startSession = useCallback(
    async (foodIntake: FoodIntake, goal: SessionGoal, drinkLimit: number) => {
      const profile = data.profile
      const alarms = profile ? buildSessionAlarms(profile) : undefined

      if (alarms && profile?.workTomorrow) {
        const granted = await requestNotificationPermission()
        if (granted) {
          await scheduleSessionAlarms(alarms)
        }
      }

      const session: ActiveSession = {
        id: generateId(),
        startedAt: Date.now(),
        drinks: [],
        foodIntake,
        goal,
        drinkLimit,
        hydration: [],
        alarms,
      }
      setData((prev) => ({ ...prev, activeSession: session }))
      return session
    },
    [data.profile],
  )

  const endSession = useCallback(() => {
    setData((prev) => {
      if (!prev.activeSession || !prev.profile) {
        return { ...prev, activeSession: null }
      }

      const session = prev.activeSession
      const peakBac = calculateBAC(
        session.drinks,
        prev.profile,
        Date.now(),
        session.foodIntake,
      )
      const completed: CompletedSession = {
        id: session.id,
        startedAt: session.startedAt,
        endedAt: Date.now(),
        drinks: session.drinks,
        foodIntake: session.foodIntake,
        goal: session.goal,
        drinkLimit: session.drinkLimit,
        hydration: session.hydration,
        peakBac,
        peakZone: getZone(peakBac).zone,
        hydrationGlasses: totalGlasses(session.hydration),
      }

      setLastCompletedSession(completed)

      if (uid && cloudReady) {
        saveCompletedSession(uid, completed).catch((err: Error) => {
          setSyncError(err.message)
        })
      }

      if (session.alarms?.wakeUpAt && prev.profile.workTomorrow) {
        const breakfast = morningBreakfastSuggestion(completed)
        void scheduleMorningAlarm(session.alarms.wakeUpAt, breakfast)
      }

      return {
        ...prev,
        activeSession: null,
        sessionHistory: [completed, ...prev.sessionHistory].slice(0, 100),
      }
    })
  }, [uid, cloudReady])

  const dismissRecovery = useCallback(() => {
    setLastCompletedSession(null)
  }, [])

  const rateRecovery = useCallback((sessionId: string, rating: number) => {
    setData((prev) => ({
      ...prev,
      sessionHistory: prev.sessionHistory.map((s) =>
        s.id === sessionId ? { ...s, recoveryRating: rating } : s,
      ),
    }))
    setLastCompletedSession(null)
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

  const addWater = useCallback((glasses: number = 1) => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      const entry = { id: generateId(), glasses, timestamp: Date.now() }
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          hydration: [...prev.activeSession.hydration, entry],
        },
      }
    })
  }, [])

  const dismissFastDrinkingAlert = useCallback(() => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          fastDrinkingDismissedAt: Date.now(),
        },
      }
    })
  }, [])

  const dismissMidSessionRecovery = useCallback(() => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          midSessionRecoveryDismissed: true,
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

  const dismissLimitWarning = useCallback(() => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          limitWarningDismissed: true,
        },
      }
    })
  }, [])

  const dismissHydrationReminder = useCallback(() => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          hydrationReminderDismissedAt: Date.now(),
        },
      }
    })
  }, [])

  const dismissPatternFlag = useCallback(() => {
    setData((prev) => ({
      ...prev,
      patternFlagShownAt: Date.now(),
    }))
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
    sessionHistory: data.sessionHistory,
    lastCompletedSession,
    syncing,
    syncError,
    setProfile,
    startSession,
    endSession,
    dismissRecovery,
    rateRecovery,
    addDrink,
    addWater,
    updateDrink,
    deleteDrink,
    dismissFastDrinkingAlert,
    dismissMidSessionRecovery,
    dismissEmptyStomachWarning,
    dismissLimitWarning,
    dismissHydrationReminder,
    dismissPatternFlag,
  }
}
