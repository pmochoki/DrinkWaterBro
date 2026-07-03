import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { AppData } from '../types'

const DEFAULT_DATA: AppData = {
  profile: null,
  activeSession: null,
}

function userDocRef(uid: string) {
  return doc(db, 'users', uid, 'data', 'app')
}

export async function loadFirestoreAppData(uid: string): Promise<AppData> {
  const snap = await getDoc(userDocRef(uid))
  if (!snap.exists()) return { ...DEFAULT_DATA }

  const data = snap.data() as AppData
  const session = data.activeSession
  return {
    profile: data.profile ?? null,
    activeSession: session && session.foodIntake ? session : null,
  }
}

export async function saveFirestoreAppData(uid: string, data: AppData): Promise<void> {
  await setDoc(userDocRef(uid), data, { merge: true })
}
