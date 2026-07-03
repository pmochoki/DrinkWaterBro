import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  ActiveSession,
  AppData,
  CompletedSession,
  DrinkEntry,
  HydrationEntry,
  UserProfile,
} from '../types'

function totalGlassesFromEntries(hydration: HydrationEntry[]): number {
  return hydration.reduce((sum, h) => sum + h.glasses, 0)
}

const DEFAULT_DATA: AppData = {
  profile: null,
  activeSession: null,
  sessionHistory: [],
}

function profileRef(uid: string) {
  return doc(db, 'users', uid, 'profile', 'main')
}

function metaRef(uid: string) {
  return doc(db, 'users', uid, 'meta', 'app')
}

function sessionRef(uid: string, sessionId: string) {
  return doc(db, 'users', uid, 'sessions', sessionId)
}

function legacyRef(uid: string) {
  return doc(db, 'users', uid, 'data', 'app')
}

async function loadSessionDrinks(uid: string, sessionId: string): Promise<DrinkEntry[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'sessions', sessionId, 'drinks'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DrinkEntry)
}

async function loadSessionHydration(uid: string, sessionId: string): Promise<HydrationEntry[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'sessions', sessionId, 'hydration'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HydrationEntry)
}

async function loadSession(
  uid: string,
  sessionId: string,
  data: Record<string, unknown>,
): Promise<ActiveSession | CompletedSession> {
  const [drinks, hydration] = await Promise.all([
    loadSessionDrinks(uid, sessionId),
    loadSessionHydration(uid, sessionId),
  ])

  const base = {
    id: sessionId,
    startedAt: data.startedAt as number,
    drinks,
    foodIntake: data.foodIntake as ActiveSession['foodIntake'],
    goal: data.goal as ActiveSession['goal'],
    drinkLimit: data.drinkLimit as number,
    hydration,
    alarms: data.alarms as ActiveSession['alarms'],
    fastDrinkingDismissedAt: data.fastDrinkingDismissedAt as number | undefined,
    emptyStomachWarningDismissed: data.emptyStomachWarningDismissed as boolean | undefined,
    limitWarningDismissed: data.limitWarningDismissed as boolean | undefined,
    hydrationReminderDismissedAt: data.hydrationReminderDismissedAt as number | undefined,
    midSessionRecoveryDismissed: data.midSessionRecoveryDismissed as boolean | undefined,
  }

  if (data.endedAt) {
    return {
      ...base,
      endedAt: data.endedAt as number,
      drinkLimit: (data.drinkLimit as number) ?? 4,
      hydration,
      peakBac: data.peakBac as number,
      peakZone: data.peakZone as CompletedSession['peakZone'],
      hydrationGlasses: (data.hydrationGlasses as number) ?? totalGlassesFromEntries(hydration),
      recoveryRating: data.recoveryRating as number | undefined,
    } as CompletedSession
  }

  return base as ActiveSession
}

async function loadFromStructured(uid: string): Promise<AppData | null> {
  const [profileSnap, metaSnap, sessionsSnap] = await Promise.all([
    getDoc(profileRef(uid)),
    getDoc(metaRef(uid)),
    getDocs(collection(db, 'users', uid, 'sessions')),
  ])

  if (!profileSnap.exists() && sessionsSnap.empty && !metaSnap.exists()) {
    return null
  }

  const profile = profileSnap.exists() ? (profileSnap.data() as UserProfile) : null
  const meta = metaSnap.exists() ? metaSnap.data() : {}
  let activeSession: ActiveSession | null = null
  const sessionHistory: CompletedSession[] = []

  for (const sessionDoc of sessionsSnap.docs) {
    const session = await loadSession(uid, sessionDoc.id, sessionDoc.data())
    if ('endedAt' in session && session.endedAt) {
      sessionHistory.push(session as CompletedSession)
    } else {
      activeSession = session as ActiveSession
    }
  }

  sessionHistory.sort((a, b) => b.endedAt - a.endedAt)

  return {
    profile,
    activeSession,
    sessionHistory: sessionHistory.slice(0, 100),
    patternFlagShownAt: meta.patternFlagShownAt as number | undefined,
  }
}

async function loadLegacy(uid: string): Promise<AppData | null> {
  const snap = await getDoc(legacyRef(uid))
  if (!snap.exists()) return null
  const data = snap.data() as Partial<AppData>
  return {
    profile: data.profile ?? null,
    activeSession: data.activeSession?.foodIntake ? data.activeSession : null,
    sessionHistory: data.sessionHistory ?? [],
    patternFlagShownAt: data.patternFlagShownAt,
  }
}

async function migrateLegacy(uid: string, data: AppData): Promise<void> {
  await saveAppData(uid, data)
  for (const session of data.sessionHistory) {
    await saveCompletedSession(uid, session)
  }
}

export async function loadAppData(uid: string): Promise<AppData> {
  const structured = await loadFromStructured(uid)
  if (structured && (structured.profile || structured.activeSession || structured.sessionHistory.length > 0)) {
    return structured
  }

  const legacy = await loadLegacy(uid)
  if (legacy && (legacy.profile || legacy.activeSession || legacy.sessionHistory.length > 0)) {
    await migrateLegacy(uid, legacy)
    return legacy
  }

  return { ...DEFAULT_DATA }
}

async function writeSessionSubcollections(
  batch: ReturnType<typeof writeBatch>,
  uid: string,
  session: ActiveSession | CompletedSession,
): Promise<void> {
  const drinksCol = collection(db, 'users', uid, 'sessions', session.id, 'drinks')
  const hydrationCol = collection(db, 'users', uid, 'sessions', session.id, 'hydration')
  const hydration =
    'hydration' in session && session.hydration ? session.hydration : []

  for (const drink of session.drinks) {
    const { id, ...rest } = drink
    batch.set(doc(drinksCol, id), rest)
  }

  for (const entry of hydration) {
    const { id, ...rest } = entry
    batch.set(doc(hydrationCol, id), rest)
  }
}

function sessionDocData(session: ActiveSession | CompletedSession): Record<string, unknown> {
  const base: Record<string, unknown> = {
    startedAt: session.startedAt,
    foodIntake: session.foodIntake,
    goal: session.goal,
    drinkLimit: session.drinkLimit,
  }

  if ('endedAt' in session && session.endedAt) {
    base.endedAt = session.endedAt
    base.peakBac = session.peakBac
    base.peakZone = session.peakZone
    base.hydrationGlasses = session.hydrationGlasses
    base.recoveryRating = session.recoveryRating
    return base
  }

  const active = session as ActiveSession
  return {
    ...base,
    endedAt: null,
    alarms: active.alarms,
    fastDrinkingDismissedAt: active.fastDrinkingDismissedAt,
    emptyStomachWarningDismissed: active.emptyStomachWarningDismissed,
    limitWarningDismissed: active.limitWarningDismissed,
    hydrationReminderDismissedAt: active.hydrationReminderDismissedAt,
    midSessionRecoveryDismissed: active.midSessionRecoveryDismissed,
  }
}

export async function saveAppData(uid: string, data: AppData): Promise<void> {
  if (data.profile) {
    await setDoc(profileRef(uid), data.profile)
  }

  await setDoc(metaRef(uid), { patternFlagShownAt: data.patternFlagShownAt ?? null }, { merge: true })

  if (data.activeSession) {
    await saveActiveSession(uid, data.activeSession)
  }
}

export async function saveProfile(uid: string, profile: UserProfile): Promise<void> {
  await setDoc(profileRef(uid), profile)
}

export async function saveActiveSession(uid: string, session: ActiveSession): Promise<void> {
  const batch = writeBatch(db)
  batch.set(sessionRef(uid, session.id), sessionDocData(session))
  await writeSessionSubcollections(batch, uid, session)
  await batch.commit()
}

export async function saveCompletedSession(uid: string, session: CompletedSession): Promise<void> {
  const batch = writeBatch(db)
  batch.set(sessionRef(uid, session.id), sessionDocData(session))
  await writeSessionSubcollections(batch, uid, session)
  await batch.commit()
}

export async function getActiveSessionId(uid: string): Promise<string | null> {
  const q = query(
    collection(db, 'users', uid, 'sessions'),
    where('endedAt', '==', null),
  )
  const snap = await getDocs(q)
  return snap.empty ? null : snap.docs[0].id
}
