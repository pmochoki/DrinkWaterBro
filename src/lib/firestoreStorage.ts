import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { AppData } from '../types'
import { loadAppData } from './storage'

const DEFAULT_DATA: AppData = {
  profile: null,
  activeSession: null,
  sessionHistory: [],
}

function userDocRef(uid: string) {
  return doc(db, 'users', uid, 'data', 'app')
}

function normalizeAppData(data: Partial<AppData>): AppData {
  const local = loadAppData()
  return {
    profile: data.profile ?? null,
    activeSession: data.activeSession?.foodIntake ? data.activeSession : null,
    sessionHistory: data.sessionHistory ?? local.sessionHistory ?? [],
    patternFlagShownAt: data.patternFlagShownAt,
  }
}

export async function loadFirestoreAppData(uid: string): Promise<AppData> {
  const snap = await getDoc(userDocRef(uid))
  if (!snap.exists()) return { ...DEFAULT_DATA }

  return normalizeAppData(snap.data() as Partial<AppData>)
}

export async function saveFirestoreAppData(uid: string, data: AppData): Promise<void> {
  await setDoc(userDocRef(uid), data, { merge: true })
}
