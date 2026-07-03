import { useState } from 'react'
import { Layout } from './components/Layout'
import { ProfileSetup } from './components/ProfileSetup'
import { LimitSetter } from './components/LimitSetter'
import { ZoneIndicator } from './components/ZoneIndicator'
import { DrinkLogger } from './components/DrinkLogger'
import { FoodLogger } from './components/FoodLogger'
import { WaterLogger } from './components/WaterLogger'
import { SessionLog } from './components/SessionLog'
import { SessionHistory } from './components/SessionHistory'
import { HydrationReminder } from './components/HydrationReminder'
import { useSession } from './hooks/useSession'
import { useBAC } from './hooks/useBAC'
import { useHydrationReminder } from './hooks/useHydrationReminder'

type View = 'session' | 'profile' | 'history'

function App() {
  const [view, setView] = useState<View>('session')
  const {
    session,
    profile,
    history,
    loading,
    updateProfile,
    startSession,
    endSession,
    addDrink,
    addFood,
    addWater,
  } = useSession()

  const drinks = session?.drinks ?? []
  const food = session?.food ?? []
  const water = session?.water ?? []
  const personalLimit = session?.personalLimitPercent ?? 0.05

  const { bac, zone, limitReached, limitApproaching } = useBAC(
    session?.profile ?? profile,
    drinks,
    food,
    personalLimit,
  )

  const lastWaterAt =
    water.length > 0 ? Math.max(...water.map((w) => w.timestamp)) : session?.startedAt ?? null

  const { showReminder, minutesSinceWater, dismiss } = useHydrationReminder(
    !!session,
    lastWaterAt,
  )

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <Layout view={view} onNavigate={setView}>
      {view === 'profile' && (
        <ProfileSetup
          profile={profile}
          onSave={async (p) => {
            await updateProfile(p)
            setView('session')
          }}
        />
      )}

      {view === 'history' && <SessionHistory sessions={history} />}

      {view === 'session' && (
        <div className="space-y-6">
          {!profile ? (
            <div className="space-y-4 text-center">
              <p className="text-slate-400">Set up your profile to get started.</p>
              <button
                type="button"
                onClick={() => setView('profile')}
                className="rounded-xl bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-500"
              >
                Set up profile
              </button>
            </div>
          ) : !session ? (
            <LimitSetter onStart={startSession} />
          ) : (
            <>
              {limitReached && (
                <div className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-center text-danger">
                  You've hit your personal limit. Consider stopping and hydrating.
                </div>
              )}

              <ZoneIndicator
                zone={zone}
                bac={bac}
                personalLimit={personalLimit}
                limitReached={limitReached}
                limitApproaching={limitApproaching}
              />

              <DrinkLogger onAdd={addDrink} />
              <FoodLogger onAdd={addFood} />
              <WaterLogger
                onAdd={addWater}
                totalWaterMl={water.reduce((sum, w) => sum + w.volumeMl, 0)}
              />

              <SessionLog
                drinks={drinks}
                food={food}
                water={water}
                startedAt={session.startedAt}
              />

              <button
                type="button"
                onClick={endSession}
                className="w-full rounded-xl border border-slate-600 py-3 text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                End session
              </button>
            </>
          )}
        </div>
      )}

      <HydrationReminder
        show={showReminder && view === 'session' && !!session}
        minutesSinceWater={minutesSinceWater}
        onDismiss={dismiss}
        onLogWater={() => {
          addWater(250)
          dismiss()
        }}
      />
    </Layout>
  )
}

export default App
