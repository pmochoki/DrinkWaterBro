import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    if (loading || user || error) return

    signInAnonymously(auth).catch((err) => {
      setError(err.message)
      setLoading(false)
    })
  }, [loading, user, error])

  return { user, loading, error }
}
