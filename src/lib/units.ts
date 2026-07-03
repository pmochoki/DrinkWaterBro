import type { WeightUnit } from '../types'

export function weightToGrams(weight: number, unit: WeightUnit): number {
  return unit === 'kg' ? weight * 1000 : weight * 453.592
}

export function lbToKg(lb: number): number {
  return lb * 0.453592
}

export function kgToLb(kg: number): number {
  return kg / 0.453592
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54
}

export function ozToMl(oz: number): number {
  return oz * 29.5735
}

export function mlToOz(ml: number): number {
  return ml / 29.5735
}

export function formatBAC(bac: number): string {
  return bac.toFixed(3)
}

export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  if (rem === 0) return `~${hours} hr`
  return `~${hours} hr ${rem} min`
}

export function formatTimeSince(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  if (rem === 0) return `${hours}h ago`
  return `${hours}h ${rem}m ago`
}
