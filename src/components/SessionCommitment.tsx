import { GOAL_OPTIONS } from '../lib/constants'
import type { SessionGoal } from '../types'

interface SessionCommitmentProps {
  onSelect: (goal: SessionGoal, limit: number) => void
}

export function SessionCommitment({ onSelect }: SessionCommitmentProps) {
  return (
    <div className="flex min-h-dvh flex-col justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-white">What's the plan tonight?</h2>
        <p className="mt-2 text-slate-400">
          Set a personal limit before you start — awareness, not rules.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {GOAL_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value, option.limit)}
            className="flex items-center gap-4 rounded-2xl bg-surface-light px-5 py-4 text-left transition-transform active:scale-[0.98]"
          >
            <span className="text-3xl">{option.emoji}</span>
            <div>
              <p className="font-semibold text-white">{option.label}</p>
              <p className="text-xs text-slate-400">
                ~{option.limit} drinks · {option.hint}
              </p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        We'll gently flag when you're approaching your limit — no hard blocks, just a caring nudge.
      </p>
    </div>
  )
}
