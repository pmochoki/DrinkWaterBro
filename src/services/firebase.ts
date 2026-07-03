import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function requireEnv(value: string | undefined, name: string): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing Firebase env var: ${name}. Copy .env.example to .env and add your project keys.`,
    )
  }
  return value
}

requireEnv(firebaseConfig.apiKey, 'VITE_FIREBASE_API_KEY')
requireEnv(firebaseConfig.authDomain, 'VITE_FIREBASE_AUTH_DOMAIN')
requireEnv(firebaseConfig.projectId, 'VITE_FIREBASE_PROJECT_ID')
requireEnv(firebaseConfig.storageBucket, 'VITE_FIREBASE_STORAGE_BUCKET')
requireEnv(firebaseConfig.messagingSenderId, 'VITE_FIREBASE_MESSAGING_SENDER_ID')
requireEnv(firebaseConfig.appId, 'VITE_FIREBASE_APP_ID')

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
