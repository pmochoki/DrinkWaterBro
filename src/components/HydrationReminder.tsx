interface HydrationReminderProps {
  show: boolean
  minutesSinceWater: number
  onDismiss: () => void
  onLogWater: () => void
}

export function HydrationReminder({
  show,
  minutesSinceWater,
  onDismiss,
  onLogWater,
}: HydrationReminderProps) {
  if (!show) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg animate-pulse rounded-2xl border border-sky-500/50 bg-sky-950 p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <span className="text-3xl">💧</span>
        <div className="flex-1">
          <p className="font-semibold text-sky-300">Hey bro, drink some water</p>
          <p className="mt-1 text-sm text-slate-300">
            {minutesSinceWater >= 30
              ? `It's been ${minutesSinceWater}+ minutes since you hydrated.`
              : 'Time for a water break.'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onLogWater}
              className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-500"
            >
              Log water
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg px-4 py-1.5 text-sm text-slate-400 hover:text-slate-200"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
