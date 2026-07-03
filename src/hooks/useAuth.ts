import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localOnly, setLocalOnly] = useState(false)

  useEffect(() => {
    let cancelled = false

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (cancelled) return
        setUser(nextUser)
        setLoading(false)
      },
      (err) => {
        if (cancelled) return
        setError(err.message)
        setLocalOnly(true)
        setLoading(false)
      },
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loading || user || localOnly) return

    signInAnonymously(auth).catch((err) => {
      // Anonymous auth may not be enabled yet — app still works locally
      setError(err.message)
      setLocalOnly(true)
      setLoading(false)
    })
  }, [loading, user, localOnly])

  return { user, loading, error, localOnly, cloudReady: !!user && !localOnly }
}
