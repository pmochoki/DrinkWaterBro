import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Session, SessionSummary, UserProfile } from '../types'
import { calculateBAC, getZone } from './bac'

type StoredProfile = UserProfile & { id: string }

interface DrinkWaterBroDB extends DBSchema {
  sessions: {
    key: string
    value: Session
    indexes: { 'by-started': number }
  }
  profile: {
    key: string
    value: StoredProfile
  }
}

const DB_NAME = 'drinkwaterbro'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<DrinkWaterBroDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DrinkWaterBroDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
        sessionStore.createIndex('by-started', 'startedAt')
        db.createObjectStore('profile', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB()
  await db.put('profile', { ...profile, id: 'user' })
}

export async function loadProfile(): Promise<UserProfile | null> {
  const db = await getDB()
  const result = await db.get('profile', 'user')
  if (!result) return null
  const { id: _, ...profile } = result
  return profile
}

export async function saveSession(session: Session): Promise<void> {
  const db = await getDB()
  await db.put('sessions', session)
}

export async function loadSession(id: string): Promise<Session | null> {
  const db = await getDB()
  return (await db.get('sessions', id)) ?? null
}

export async function loadActiveSession(): Promise<Session | null> {
  const db = await getDB()
  const all = await db.getAllFromIndex('sessions', 'by-started')
  return all.find((s) => s.endedAt === null) ?? null
}

export async function loadSessionHistory(): Promise<SessionSummary[]> {
  const db = await getDB()
  const sessions = await db.getAllFromIndex('sessions', 'by-started')
  const ended = sessions.filter((s) => s.endedAt !== null) as (Session & { endedAt: number })[]

  return ended
    .map((session) => {
      const endTime = session.endedAt
      let peakBac = 0
      const step = 5 * 60 * 1000
      for (let t = session.startedAt; t <= endTime; t += step) {
        peakBac = Math.max(peakBac, calculateBAC(session.profile, session.drinks, session.food, t))
      }
      peakBac = Math.max(
        peakBac,
        calculateBAC(session.profile, session.drinks, session.food, endTime),
      )

      const peakZone = getZone(peakBac)
      const limitReached = peakBac >= session.personalLimitPercent

      return {
        id: session.id,
        startedAt: session.startedAt,
        endedAt: endTime,
        drinkCount: session.drinks.length,
        peakBacPercent: peakBac,
        peakZone,
        personalLimitPercent: session.personalLimitPercent,
        limitReached,
      }
    })
    .sort((a, b) => b.startedAt - a.startedAt)
}

export function generateId(): string {
  return crypto.randomUUID()
}
