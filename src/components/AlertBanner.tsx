interface AlertBannerProps {
  message: string
  onDismiss: () => void
  variant?: 'info' | 'gentle'
}

export function AlertBanner({ message, onDismiss, variant = 'gentle' }: AlertBannerProps) {
  const bg =
    variant === 'gentle'
      ? 'bg-amber-500/15 border-amber-500/30'
      : 'bg-water/15 border-water/30'

  return (
    <div className={`mx-4 mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3 ${bg}`}>
      <p className="flex-1 text-sm leading-relaxed text-slate-200">{message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
