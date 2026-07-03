import { useState } from 'react'
import type { BiologicalSex, UserProfile, WeightUnit } from '../types'
import { DEFAULT_METABOLISM_RATE } from '../lib/constants'
import { feetInchesToCm } from '../lib/units'

interface ProfileFormProps {
  initial?: UserProfile | null
  onSave: (profile: UserProfile) => void
  onSignOut?: () => void
  title?: string
}

export function ProfileForm({ initial, onSave, onSignOut, title = 'Your Profile' }: ProfileFormProps) {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(initial?.weightUnit ?? 'kg')
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? '')
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm')
  const [heightCm, setHeightCm] = useState(initial?.heightCm?.toString() ?? '')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [age, setAge] = useState(initial?.age?.toString() ?? '')
  const [sex, setSex] = useState<BiologicalSex>(initial?.sex ?? 'male')
  const [workTomorrow, setWorkTomorrow] = useState(initial?.workTomorrow ?? false)
  const [wakeTimeHour, setWakeTimeHour] = useState(
    initial?.wakeTimeHour?.toString() ?? '7',
  )
  const [wakeTimeMinute, setWakeTimeMinute] = useState(
    initial?.wakeTimeMinute?.toString() ?? '0',
  )
  const [country, setCountry] = useState(initial?.country ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const weightNum = parseFloat(weight)
    const ageNum = parseInt(age, 10)

    if (!weightNum || weightNum <= 0) {
      setError('Need a real weight here — helps the estimates stay useful.')
      return
    }
    if (!ageNum || ageNum < 18 || ageNum > 120) {
      setError('Gotta be 18+ to use this.')
      return
    }

    let cm: number
    if (heightUnit === 'cm') {
      cm = parseFloat(heightCm)
      if (!cm || cm <= 0) {
        setError('Pop in your height so we can dial in the estimates.')
        return
      }
    } else {
      const ft = parseInt(heightFt, 10)
      const inches = parseInt(heightIn, 10)
      if (isNaN(ft) || isNaN(inches)) {
        setError('Pop in your height so we can dial in the estimates.')
        return
      }
      cm = feetInchesToCm(ft, inches)
    }

    onSave({
      weight: weightNum,
      weightUnit,
      heightCm: cm,
      age: ageNum,
      sex,
      workTomorrow,
      metabolismRate: initial?.metabolismRate ?? DEFAULT_METABOLISM_RATE,
      country: country || undefined,
      wakeTimeHour: workTomorrow ? parseInt(wakeTimeHour, 10) : undefined,
      wakeTimeMinute: workTomorrow ? parseInt(wakeTimeMinute, 10) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Just the basics — used for rough BAC estimates. Edit anytime.
        </p>
      </div>

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

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">Height</legend>
        <div className="mb-2 flex w-fit rounded-xl bg-surface-light p-1">
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

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">
          Do you have work tomorrow?
        </legend>
        <p className="mb-2 text-xs text-slate-500">
          Helps us tailor recovery tips and alarms later on.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWorkTomorrow(true)}
            className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
              workTomorrow
                ? 'bg-water text-surface'
                : 'bg-surface-light text-slate-400 hover:text-white'
            }`}
          >
            Yeah, unfortunately
          </button>
          <button
            type="button"
            onClick={() => setWorkTomorrow(false)}
            className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
              !workTomorrow
                ? 'bg-water text-surface'
                : 'bg-surface-light text-slate-400 hover:text-white'
            }`}
          >
            Nope, day off
          </button>
        </div>
        {workTomorrow && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Wake up at</span>
            <input
              type="number"
              min={0}
              max={23}
              value={wakeTimeHour}
              onChange={(e) => setWakeTimeHour(e.target.value)}
              className="w-16 rounded-lg bg-surface-light px-2 py-1 text-center text-white"
            />
            <span className="text-slate-400">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={wakeTimeMinute}
              onChange={(e) => setWakeTimeMinute(e.target.value)}
              className="w-16 rounded-lg bg-surface-light px-2 py-1 text-center text-white"
            />
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">
          Country (optional)
        </legend>
        <p className="mb-2 text-xs text-slate-500">
          For local support resources if we ever notice concerning patterns.
        </p>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-xl bg-surface-light px-4 py-3 text-white outline-none"
        >
          <option value="">Select country</option>
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
        </select>
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

      {onSignOut && (
        <button
          type="button"
          onClick={onSignOut}
          className="mt-3 w-full py-2 text-sm text-slate-500 underline"
        >
          Sign out
        </button>
      )}
    </form>
  )
}
