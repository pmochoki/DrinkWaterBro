import { useAppData } from './hooks/useAppData'
import { ProfileForm } from './components/ProfileForm'
import { SessionView } from './components/SessionView'

export default function App() {
  const {
    profile,
    activeSession,
    setProfile,
    endSession,
    addDrink,
    updateDrink,
    deleteDrink,
  } = useAppData()

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-water">DrinkWaterBro</h1>
          <p className="mt-2 text-slate-400">
            Your harm-reduction buddy for nights out.
            <br />
            Stay aware. Stay in control. Drink water, bro. 💧
          </p>
        </div>
        <ProfileForm onSave={setProfile} />
      </div>
    )
  }

  const drinks = activeSession?.drinks ?? []

  return (
    <div className="mx-auto max-w-lg">
      <SessionView
        profile={profile}
        drinks={drinks}
        onAddDrink={addDrink}
        onUpdateDrink={updateDrink}
        onDeleteDrink={deleteDrink}
        onUpdateProfile={setProfile}
        onEndSession={endSession}
      />
    </div>
  )
}
