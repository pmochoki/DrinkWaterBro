import { useState } from 'react'
import { useAppData } from './hooks/useAppData'
import { useAuth } from './hooks/useAuth'
import { ProfileForm } from './components/ProfileForm'
import { SessionView } from './components/SessionView'
import { FoodCheckIn } from './components/FoodCheckIn'
import { SessionCommitment } from './components/SessionCommitment'
import { RecoveryPlan } from './components/RecoveryPlan'
import { SessionHistory } from './components/SessionHistory'
import { PatternFlag } from './components/PatternFlag'
import { SignIn } from './components/SignIn'
import { detectDrinkingPatterns } from './lib/patterns'
import type { SessionGoal } from './types'

type PreSessionStep = 'commitment' | 'food'

export default function App() {
  const { user, loading: authLoading, signingIn, error: authError, signInWithGoogle, signOut, cloudReady } = useAuth()
  const {
    profile,
    activeSession,
    sessionHistory,
    lastCompletedSession,
    syncing,
    syncError,
    setProfile,
    startSession,
    endSession,
    dismissRecovery,
    rateRecovery,
    addDrink,
    addWater,
    updateDrink,
    deleteDrink,
    dismissFastDrinkingAlert,
    dismissEmptyStomachWarning,
    dismissLimitWarning,
    dismissHydrationReminder,
    dismissPatternFlag,
    data,
  } = useAppData({ uid: user?.uid, cloudReady })

  const [preSessionStep, setPreSessionStep] = useState<PreSessionStep>('commitment')
  const [pendingGoal, setPendingGoal] = useState<{ goal: SessionGoal; limit: number } | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const pattern = detectDrinkingPatterns(
    sessionHistory,
    data.patternFlagShownAt,
  )

  if (authLoading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
        <p className="text-slate-400">Connecting…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <SignIn
        onSignIn={signInWithGoogle}
        loading={signingIn}
        error={authError}
      />
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-water">DrinkWaterBro</h1>
          <p className="mt-2 text-slate-400">
            Like a friend who actually knows how alcohol works.
            <br />
            Stay aware. Stay in control. Drink water, bro. 💧
          </p>
          {syncing && <p className="mt-2 text-xs text-slate-500">Syncing your data…</p>}
          {syncError && <p className="mt-2 text-xs text-amber-400">Cloud sync issue — saved locally.</p>}
        </div>
        <ProfileForm onSave={setProfile} onSignOut={() => void signOut()} />
      </div>
    )
  }

  if (lastCompletedSession) {
    return (
      <div className="mx-auto max-w-lg">
        <RecoveryPlan
          session={lastCompletedSession}
          profile={profile}
          onDone={dismissRecovery}
          onRate={(rating) => rateRecovery(lastCompletedSession.id, rating)}
        />
      </div>
    )
  }

  if (showHistory) {
    return (
      <div className="mx-auto max-w-lg">
        <SessionHistory sessions={sessionHistory} onBack={() => setShowHistory(false)} />
      </div>
    )
  }

  if (!activeSession) {
    if (preSessionStep === 'commitment') {
      return (
        <div className="mx-auto max-w-lg">
          {pattern.show && (
            <div className="pt-3">
              <PatternFlag
                message={pattern.message}
                country={profile.country}
                onDismiss={dismissPatternFlag}
              />
            </div>
          )}
          <SessionCommitment
            onSelect={(goal, limit) => {
              setPendingGoal({ goal, limit })
              setPreSessionStep('food')
            }}
          />
          <div className="px-4 pb-6 text-center">
            <button
              onClick={() => setShowHistory(true)}
              className="text-sm text-slate-500 underline"
            >
              View session history
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-lg">
        {syncError && (
          <p className="px-4 pt-3 text-center text-xs text-amber-400">Cloud sync issue — saved locally.</p>
        )}
        <FoodCheckIn
          onSelect={(foodIntake) => {
            if (pendingGoal) {
              startSession(foodIntake, pendingGoal.goal, pendingGoal.limit)
              setPendingGoal(null)
              setPreSessionStep('commitment')
            }
          }}
          onBack={() => setPreSessionStep('commitment')}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      {syncError && (
        <p className="px-4 pt-3 text-center text-xs text-amber-400">Cloud sync issue — saved locally.</p>
      )}
      <SessionView
        profile={profile}
        foodIntake={activeSession.foodIntake}
        drinks={activeSession.drinks}
        hydration={activeSession.hydration}
        drinkLimit={activeSession.drinkLimit}
        fastDrinkingAlertDismissed={activeSession.fastDrinkingAlertDismissed ?? false}
        emptyStomachWarningDismissed={activeSession.emptyStomachWarningDismissed ?? false}
        limitWarningDismissed={activeSession.limitWarningDismissed ?? false}
        hydrationReminderDismissedAt={activeSession.hydrationReminderDismissedAt}
        onAddDrink={addDrink}
        onAddWater={addWater}
        onUpdateDrink={updateDrink}
        onDeleteDrink={deleteDrink}
        onUpdateProfile={setProfile}
        onEndSession={endSession}
        onShowHistory={() => setShowHistory(true)}
        onDismissFastDrinkingAlert={dismissFastDrinkingAlert}
        onDismissEmptyStomachWarning={dismissEmptyStomachWarning}
        onDismissLimitWarning={dismissLimitWarning}
        onDismissHydrationReminder={dismissHydrationReminder}
      />
    </div>
  )
}
