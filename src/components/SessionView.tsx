import { useState } from 'react'
import { ZoneGauge } from './ZoneGauge'
import { DrinkLogger } from './DrinkLogger'
import { DrinkList } from './DrinkList'
import { ProfileForm } from './ProfileForm'
import { AlertBanner } from './AlertBanner'
import { FoodTips } from './FoodTips'
import { HydrationTracker } from './HydrationTracker'
import { useLiveBAC } from '../hooks/useLiveBAC'
import { formatTimeSince } from '../lib/units'
import { detectFastDrinking } from '../lib/drinkingRate'
import { shouldRemindHydration } from '../lib/hydration'
import type { DrinkEntry, FoodIntake, HydrationEntry, UserProfile } from '../types'

interface SessionViewProps {
  profile: UserProfile
  foodIntake: FoodIntake
  drinks: DrinkEntry[]
  hydration: HydrationEntry[]
  drinkLimit: number
  fastDrinkingAlertDismissed: boolean
  emptyStomachWarningDismissed: boolean
  limitWarningDismissed: boolean
  hydrationReminderDismissedAt?: number
  onAddDrink: (drink: Omit<DrinkEntry, 'id'>) => void
  onAddWater: (glasses?: number) => void
  onUpdateDrink: (id: string, updates: Partial<DrinkEntry>) => void
  onDeleteDrink: (id: string) => void
  onUpdateProfile: (profile: UserProfile) => void
  onEndSession: () => void
  onShowHistory: () => void
  onDismissFastDrinkingAlert: () => void
  onDismissEmptyStomachWarning: () => void
  onDismissLimitWarning: () => void
  onDismissHydrationReminder: () => void
}

export function SessionView({
  profile,
  foodIntake,
  drinks,
  hydration,
  drinkLimit,
  fastDrinkingAlertDismissed,
  emptyStomachWarningDismissed,
  limitWarningDismissed,
  hydrationReminderDismissedAt,
  onAddDrink,
  onAddWater,
  onUpdateDrink,
  onDeleteDrink,
  onUpdateProfile,
  onEndSession,
  onShowHistory,
  onDismissFastDrinkingAlert,
  onDismissEmptyStomachWarning,
  onDismissLimitWarning,
  onDismissHydrationReminder,
}: SessionViewProps) {
  const { bac, now } = useLiveBAC(drinks, profile, foodIntake)
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

  const showEmptyStomachWarning =
    foodIntake === 'nothing' &&
    !emptyStomachWarningDismissed &&
    drinks.length === 0

  const approachingLimit =
    !limitWarningDismissed &&
    drinkLimit > 0 &&
    drinks.length >= drinkLimit - 1 &&
    drinks.length < drinkLimit

  const atLimit =
    !limitWarningDismissed &&
    drinkLimit > 0 &&
    drinks.length >= drinkLimit

  const showHydrationReminder = shouldRemindHydration(
    drinks,
    hydration,
    hydrationReminderDismissedAt,
    now,
  )

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
          <p className="text-xs text-slate-500">
            {drinks.length}/{drinkLimit} drinks tonight
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShowHistory}
            className="rounded-xl bg-surface-light px-3 py-2 text-xs text-slate-400"
          >
            History
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="rounded-xl bg-surface-light px-3 py-2 text-xs text-slate-400"
          >
            Profile
          </button>
        </div>
      </header>

      {showEmptyStomachWarning && (
        <AlertBanner
          message="Yo, alcohol hits WAY harder on an empty stomach. Eat something before your first drink if you can — bread, pasta, eggs, anything with fat or protein."
          onDismiss={onDismissEmptyStomachWarning}
          variant="gentle"
        />
      )}

      {showFastAlert && (
        <AlertBanner
          message="Hey, that's coming in fast. How are you feeling? Maybe slow it down and grab some water?"
          onDismiss={onDismissFastDrinkingAlert}
        />
      )}

      {approachingLimit && (
        <AlertBanner
          message={`You're at ${drinks.length} drinks — your personal limit tonight is ${drinkLimit}. Just a heads up, no judgment.`}
          onDismiss={onDismissLimitWarning}
          variant="gentle"
        />
      )}

      {atLimit && (
        <AlertBanner
          message={`You've hit your ${drinkLimit}-drink limit for tonight. Awareness, not rules — but maybe switch to water?`}
          onDismiss={onDismissLimitWarning}
          variant="gentle"
        />
      )}

      {showHydrationReminder && (
        <AlertBanner
          message="Time for some water, bro 💧 You've had a few drinks since your last glass."
          onDismiss={onDismissHydrationReminder}
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

      <HydrationTracker
        drinks={drinks}
        hydration={hydration}
        onLogGlass={() => onAddWater(1)}
      />

      <FoodTips foodIntake={foodIntake} />

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

      <footer className="border-t border-slate-800 px-4 py-4">
        <button
          onClick={onEndSession}
          className="w-full rounded-xl bg-surface-light py-3 text-sm text-slate-400 transition-colors hover:text-white"
        >
          Wrap up the night
        </button>
      </footer>
    </div>
  )
}
