import { useState } from 'react'
import type { UserProfile, Sex } from '../types'

interface ProfileSetupProps {
  profile: UserProfile | null
  onSave: (profile: UserProfile) => void
}

const defaultProfile: UserProfile = {
  weightKg: 70,
  heightCm: 170,
  age: 25,
  sex: 'male',
}

export function ProfileSetup({ profile, onSave }: ProfileSetupProps) {
  const [form, setForm] = useState<UserProfile>(profile ?? defaultProfile)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-sky-300">Your profile</h2>
        <p className="mt-1 text-sm text-slate-400">
          Used for BAC estimates. Stored locally on your device only.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-slate-400">Weight (kg)</span>
          <input
            type="number"
            min={30}
            max={300}
            value={form.weightKg}
            onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Height (cm)</span>
          <input
            type="number"
            min={100}
            max={250}
            value={form.heightCm}
            onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Age</span>
          <input
            type="number"
            min={18}
            max={120}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Sex</span>
          <select
            value={form.sex}
            onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-sky-600 py-3 font-medium text-white transition hover:bg-sky-500"
      >
        Save profile
      </button>
    </form>
  )
}
