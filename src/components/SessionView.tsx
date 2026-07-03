import { useState } from 'react'
import { ZoneGauge } from './ZoneGauge'
import { DrinkLogger } from './DrinkLogger'
import { DrinkList } from './DrinkList'
import { ProfileForm } from './ProfileForm'
import { AlertBanner } from './AlertBanner'
import { useLiveBAC } from '../hooks/useLiveBAC'
import { formatTimeSince } from '../lib/units'
import { detectFastDrinking } from '../lib/drinkingRate'
import type { DrinkEntry, UserProfile } from '../types'

interface SessionViewProps {
  profile: UserProfile
  drinks: DrinkEntry[]
  fastDrinkingAlertDismissed: boolean
  onAddDrink: (drink: Omit<DrinkEntry, 'id'>) => void
  onUpdateDrink: (id: string, updates: Partial<DrinkEntry>) => void
  onDeleteDrink: (id: string) => void
  onUpdateProfile: (profile: UserProfile) => void
  onEndSession: () => void
  onDismissFastDrinkingAlert: () => void
}

export function SessionView({
  profile,
  drinks,
  fastDrinkingAlertDismissed,
  onAddDrink,
  onUpdateDrink,
  onDeleteDrink,
  onUpdateProfile,
  onEndSession,
  onDismissFastDrinkingAlert,
}: SessionViewProps) {
  const { bac, now } = useLiveBAC(drinks, profile)
  const [showProfile, setShowProfile] = useState(false)

  const lastDrink =
    drinks.length > 0
      ? drinks.reduce(
          (latest, d) => (d.timestamp > latest.timestamp ? d : latest),
          drinks[0],
        )
      : null

  const showFastAlert =
    !fastDrinkingAlertDismissed && detectFastDrinking(drinks, now)

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
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-xl font-black text-water">DrinkWaterBro</h1>
          <p className="text-xs text-slate-500">your smart, caring drinking buddy</p>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="rounded-xl bg-surface-light px-3 py-2 text-xs text-slate-400"
        >
          Profile
        </button>
      </header>

      {showFastAlert && (
        <AlertBanner
          message="Hey, that's coming in fast. How are you feeling? Maybe slow it down and grab some water?"
          onDismiss={onDismissFastDrinkingAlert}
        />
      )}

      {profile.workTomorrow && drinks.length > 0 && (
        <div className="mx-4 mb-2 rounded-xl bg-surface-light/50 px-4 py-2 text-center text-xs text-slate-500">
          You've got work tomorrow — we'll help you wind down smart later.
        </div>
      )}

      <section className="px-4 py-4">
        <ZoneGauge bac={bac} profile={profile} />
      </section>

      {lastDrink && (
        <div className="mx-4 mb-4 flex items-center justify-between rounded-xl bg-surface-light px-4 py-3">
          <span className="text-sm text-slate-400">Last drink</span>
          <span className="text-sm font-medium text-white">
            {lastDrink.name} · {formatTimeSince(lastDrink.timestamp, now)}
          </span>
        </div>
      )}

      <section className="flex-1 px-4 pb-6">
        <p className="mb-3 text-sm font-medium text-slate-300">Log a drink</p>
        <DrinkLogger onAdd={onAddDrink} />
        <div className="mt-6">
          <DrinkList
            drinks={drinks}
            now={now}
            onUpdate={onUpdateDrink}
            onDelete={onDeleteDrink}
          />
        </div>
      </section>

      {drinks.length > 0 && (
        <footer className="border-t border-slate-800 px-4 py-4">
          <button
            onClick={onEndSession}
            className="w-full rounded-xl bg-surface-light py-3 text-sm text-slate-400 transition-colors hover:text-white"
          >
            Wrap up the night
          </button>
        </footer>
      )}
    </div>
  )
}
