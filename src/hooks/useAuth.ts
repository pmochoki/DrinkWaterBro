import { useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../services/firebase'
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithEmail as firebaseSignInWithEmail,
  signUpWithEmail as firebaseSignUpWithEmail,
  signOut as firebaseSignOut,
} from '../services/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)

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

  const signInWithGoogle = useCallback(async () => {
    setSigningIn(true)
    setError(null)
    try {
      await firebaseSignInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(message)
      throw err
    } finally {
      setSigningIn(false)
    }
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setSigningIn(true)
    setError(null)
    try {
      await firebaseSignInWithEmail(email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed'
      setError(message)
      throw err
    } finally {
      setSigningIn(false)
    }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setSigningIn(true)
    setError(null)
    try {
      await firebaseSignUpWithEmail(email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-up failed'
      setError(message)
      throw err
    } finally {
      setSigningIn(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    await firebaseSignOut()
  }, [])

  return {
    user,
    loading,
    error,
    signingIn,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    cloudReady: !!user,
  }
}
