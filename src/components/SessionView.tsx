import { useState } from 'react'
import { ZoneGauge } from './ZoneGauge'
import { DrinkLogger } from './DrinkLogger'
import { DrinkList } from './DrinkList'
import { ProfileForm } from './ProfileForm'
import { useLiveBAC } from '../hooks/useLiveBAC'
import { formatTimeSince } from '../lib/units'
import type { DrinkEntry, UserProfile } from '../types'

interface SessionViewProps {
  profile: UserProfile
  drinks: DrinkEntry[]
  onAddDrink: (drink: Omit<DrinkEntry, 'id'>) => void
  onUpdateDrink: (id: string, updates: Partial<DrinkEntry>) => void
  onDeleteDrink: (id: string) => void
  onUpdateProfile: (profile: UserProfile) => void
  onEndSession: () => void
}

export function SessionView({
  profile,
  drinks,
  onAddDrink,
  onUpdateDrink,
  onDeleteDrink,
  onUpdateProfile,
  onEndSession,
}: SessionViewProps) {
  const { bac, now } = useLiveBAC(drinks, profile)
  const [showProfile, setShowProfile] = useState(false)
  const [showLogger, setShowLogger] = useState(true)

  const lastDrink = drinks.length > 0
    ? drinks.reduce((latest, d) => (d.timestamp > latest.timestamp ? d : latest), drinks[0])
    : null

  if (showProfile) {
    return (
      <div className="px-4 py-6">
        <button
          onClick={() => setShowProfile(false)}
          className="mb-4 text-sm text-water"
        >
          ← Back
        </button>
        <ProfileForm
          initial={profile}
          onSave={(p) => {
            onUpdateProfile(p)
            setShowProfile(false)
          }}
          title="Edit Profile"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-xl font-black text-water">DrinkWaterBro</h1>
          <p className="text-xs text-slate-500">stay aware, stay in control</p>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="rounded-xl bg-surface-light px-3 py-2 text-xs text-slate-400"
        >
          Profile
        </button>
      </header>

      {/* Zone display — primary focus */}
      <section className="px-4 py-4">
        <ZoneGauge bac={bac} profile={profile} />
      </section>

      {/* Session info strip */}
      {lastDrink && (
        <div className="mx-4 mb-4 flex items-center justify-between rounded-xl bg-surface-light px-4 py-3">
          <span className="text-sm text-slate-400">Last drink</span>
          <span className="text-sm font-medium text-white">
            {lastDrink.name} · {formatTimeSince(lastDrink.timestamp, now)}
          </span>
        </div>
      )}

      {/* Drink logging */}
      <section className="flex-1 px-4 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">Log a drink</p>
          <button
            onClick={() => setShowLogger(!showLogger)}
            className="text-xs text-slate-500"
          >
            {showLogger ? 'Hide' : 'Show'}
          </button>
        </div>
        {showLogger && <DrinkLogger onAdd={onAddDrink} />}
        <div className="mt-6">
          <DrinkList
            drinks={drinks}
            now={now}
            onUpdate={onUpdateDrink}
            onDelete={onDeleteDrink}
          />
        </div>
      </section>

      {/* End session */}
      {drinks.length > 0 && (
        <footer className="border-t border-slate-800 px-4 py-4">
          <button
            onClick={onEndSession}
            className="w-full rounded-xl bg-surface-light py-3 text-sm text-slate-400 transition-colors hover:text-white"
          >
            End session
          </button>
        </footer>
      )}
    </div>
  )
}
