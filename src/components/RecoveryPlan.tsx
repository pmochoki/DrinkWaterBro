import {
  BEFORE_SLEEP_TIPS,
  HANGOVER_FOODS,
  AVOID_TIPS,
  NAUSEA_STOMACH_TIP,
  recoveryWaterGlasses,
  morningBreakfastSuggestion,
} from '../lib/recovery'
import { requestNotificationPermission, scheduleMorningAlarm } from '../lib/alarms'
import type { CompletedSession, UserProfile } from '../types'

interface RecoveryPlanProps {
  session: CompletedSession
  profile: UserProfile
  onDone: () => void
  onRate: (rating: number) => void
}

export function RecoveryPlan({ session, profile, onDone, onRate }: RecoveryPlanProps) {
  const waterGlasses = recoveryWaterGlasses(session)
  const breakfast = morningBreakfastSuggestion(session)

  const handleEnableAlarms = async () => {
    const granted = await requestNotificationPermission()
    if (granted && profile.wakeTimeHour != null) {
      const wake = new Date()
      wake.setDate(wake.getDate() + 1)
      wake.setHours(profile.wakeTimeHour, profile.wakeTimeMinute ?? 0, 0, 0)
      if (wake.getTime() > Date.now()) {
        await scheduleMorningAlarm(wake.getTime(), breakfast)
      }
    }
    onDone()
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 py-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-water">Recovery plan 🌙</h2>
        <p className="mt-2 text-slate-400">
          {profile.workTomorrow
            ? "You've got work tomorrow — let's set you up right."
            : 'Take care of future-you before you crash.'}
        </p>
      </div>

      <section className="mb-6 rounded-2xl bg-surface-light p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Before you sleep
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>💧 Drink <strong>{waterGlasses} glasses</strong> of water now</li>
          {BEFORE_SLEEP_TIPS.slice(1).map((tip) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl bg-surface-light p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Tomorrow morning
        </h3>
        <p className="mt-2 text-sm text-slate-300">{breakfast}</p>
        <p className="mt-3 text-sm text-slate-400">{NAUSEA_STOMACH_TIP}</p>
        <ul className="mt-3 space-y-2">
          {HANGOVER_FOODS.map(({ food, why }) => (
            <li key={food} className="text-sm text-slate-400">
              <span className="text-white">{food}</span> — {why}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl bg-surface-light/50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Skip these
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-500">
          {AVOID_TIPS.map((tip) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
      </section>

      {profile.workTomorrow && (
        <button
          onClick={() => void handleEnableAlarms()}
          className="mb-4 w-full rounded-xl bg-water/20 py-3 text-sm font-medium text-water"
        >
          Enable morning reminders
        </button>
      )}

      <div className="mb-4">
        <p className="mb-2 text-center text-sm text-slate-400">
          How do you think you'll feel tomorrow? (optional)
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onRate(n)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-light text-sm text-slate-300 transition-colors hover:bg-water/20 hover:text-water"
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-1 text-center text-xs text-slate-600">1 = rough · 5 = fine</p>
      </div>

      <button
        onClick={onDone}
        className="w-full rounded-xl bg-surface-light py-3 text-sm text-slate-400"
      >
        Done for tonight
      </button>
    </div>
  )
}
