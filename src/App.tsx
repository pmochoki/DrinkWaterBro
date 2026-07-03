import { useAppData } from './hooks/useAppData'
import { useAuth } from './hooks/useAuth'
import { ProfileForm } from './components/ProfileForm'
import { SessionView } from './components/SessionView'
import { FoodCheckIn } from './components/FoodCheckIn'

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth()
  const {
    profile,
    activeSession,
    syncing,
    syncError,
    setProfile,
    startSession,
    endSession,
    addDrink,
    updateDrink,
    deleteDrink,
    dismissFastDrinkingAlert,
    dismissEmptyStomachWarning,
  } = useAppData({ uid: user?.uid, cloudReady: !!user })

  if (authLoading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
        <p className="text-slate-400">Connecting…</p>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-red-400">Could not connect to Firebase.</p>
        <p className="text-sm text-slate-500">{authError}</p>
      </div>
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
        <ProfileForm onSave={setProfile} />
      </div>
    )
  }

  if (!activeSession) {
    return (
      <div className="mx-auto max-w-lg">
        {syncError && (
          <p className="px-4 pt-3 text-center text-xs text-amber-400">Cloud sync issue — saved locally.</p>
        )}
        <FoodCheckIn onSelect={startSession} />
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
        fastDrinkingAlertDismissed={activeSession.fastDrinkingAlertDismissed ?? false}
        emptyStomachWarningDismissed={activeSession.emptyStomachWarningDismissed ?? false}
        onAddDrink={addDrink}
        onUpdateDrink={updateDrink}
        onDeleteDrink={deleteDrink}
        onUpdateProfile={setProfile}
        onEndSession={endSession}
        onDismissFastDrinkingAlert={dismissFastDrinkingAlert}
        onDismissEmptyStomachWarning={dismissEmptyStomachWarning}
      />
    </div>
  )
}
