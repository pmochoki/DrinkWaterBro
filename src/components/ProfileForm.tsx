import { useState } from 'react'
import type { BiologicalSex, EatingHabit, UserProfile, WeightUnit } from '../types'
import { DEFAULT_METABOLISM_RATE } from '../lib/constants'
import { feetInchesToCm } from '../lib/units'

interface ProfileFormProps {
  initial?: UserProfile | null
  onSave: (profile: UserProfile) => void
  title?: string
}

export function ProfileForm({ initial, onSave, title = 'Your Profile' }: ProfileFormProps) {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(initial?.weightUnit ?? 'kg')
  const [weight, setWeight] = useState(
    initial?.weight?.toString() ?? '',
  )
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm')
  const [heightCm, setHeightCm] = useState(initial?.heightCm?.toString() ?? '')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [age, setAge] = useState(initial?.age?.toString() ?? '')
  const [sex, setSex] = useState<BiologicalSex>(initial?.sex ?? 'male')
  const [eatingHabit, setEatingHabit] = useState<EatingHabit>(
    initial?.eatingHabit ?? 'unknown',
  )
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const weightNum = parseFloat(weight)
    const ageNum = parseInt(age, 10)

    if (!weightNum || weightNum <= 0) {
      setError('Please enter a valid weight.')
      return
    }
    if (!ageNum || ageNum < 18 || ageNum > 120) {
      setError('Please enter a valid age (18+).')
      return
    }

    let cm: number
    if (heightUnit === 'cm') {
      cm = parseFloat(heightCm)
      if (!cm || cm <= 0) {
        setError('Please enter a valid height.')
        return
      }
    } else {
      const ft = parseInt(heightFt, 10)
      const inches = parseInt(heightIn, 10)
      if (isNaN(ft) || isNaN(inches)) {
        setError('Please enter a valid height.')
        return
      }
      cm = feetInchesToCm(ft, inches)
    }

    const profile: UserProfile = {
      weight: weightNum,
      weightUnit,
      heightCm: cm,
      age: ageNum,
      sex,
      eatingHabit: eatingHabit === 'unknown' ? undefined : eatingHabit,
      metabolismRate: initial?.metabolismRate ?? DEFAULT_METABOLISM_RATE,
    }

    onSave(profile)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Used for rough BAC estimates. You can edit this anytime.
        </p>
      </div>

      {/* Weight */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">Weight</legend>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={weightUnit === 'kg' ? '75' : '165'}
            className="flex-1 rounded-xl bg-surface-light px-4 py-3 text-lg text-white outline-none ring-water focus:ring-2"
            required
          />
          <div className="flex rounded-xl bg-surface-light p-1">
            {(['kg', 'lb'] as WeightUnit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setWeightUnit(u)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  weightUnit === u
                    ? 'bg-water text-surface'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      {/* Height */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">Height</legend>
        <div className="mb-2 flex rounded-xl bg-surface-light p-1 w-fit">
          {(['cm', 'ft'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setHeightUnit(u)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                heightUnit === u
                  ? 'bg-water text-surface'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        {heightUnit === 'cm' ? (
          <input
            type="number"
            inputMode="decimal"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="175"
            className="w-full rounded-xl bg-surface-light px-4 py-3 text-lg text-white outline-none ring-water focus:ring-2"
            required
          />
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              placeholder="5"
              className="flex-1 rounded-xl bg-surface-light px-4 py-3 text-lg text-white outline-none ring-water focus:ring-2"
              required
            />
            <span className="self-center text-slate-400">ft</span>
            <input
              type="number"
              inputMode="numeric"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              placeholder="9"
              className="flex-1 rounded-xl bg-surface-light px-4 py-3 text-lg text-white outline-none ring-water focus:ring-2"
              required
            />
            <span className="self-center text-slate-400">in</span>
          </div>
        )}
      </fieldset>

      {/* Age */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">Age</legend>
        <input
          type="number"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="30"
          min={18}
          max={120}
          className="w-full rounded-xl bg-surface-light px-4 py-3 text-lg text-white outline-none ring-water focus:ring-2"
          required
        />
      </fieldset>

      {/* Biological sex */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">
          Biological sex
          <span className="ml-1 text-xs text-slate-500">(for Widmark body-water ratio)</span>
        </legend>
        <div className="flex gap-2">
          {(['male', 'female'] as BiologicalSex[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSex(s)}
              className={`flex-1 rounded-xl py-3 text-sm font-medium capitalize transition-colors ${
                sex === s
                  ? 'bg-water text-surface'
                  : 'bg-surface-light text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Eating habits (optional) */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">
          Typical eating habits
          <span className="ml-1 text-xs text-slate-500">(optional)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['unknown', 'Not sure'],
              ['none', 'Usually skip meals'],
              ['light', 'Light eater'],
              ['full', 'Full meals'],
            ] as [EatingHabit, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setEatingHabit(value)}
              className={`rounded-xl py-3 px-3 text-sm font-medium transition-colors ${
                eatingHabit === value
                  ? 'bg-water text-surface'
                  : 'bg-surface-light text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="rounded-lg bg-danger/20 px-4 py-2 text-sm text-red-300">{error}</p>
      )}

      <button
        type="submit"
        className="mt-2 w-full rounded-2xl bg-water py-4 text-lg font-bold text-surface transition-transform active:scale-[0.98]"
      >
        {initial ? 'Save Changes' : "Let's Go 💧"}
      </button>
    </form>
  )
}
