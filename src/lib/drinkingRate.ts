import type { DrinkEntry } from '../types'
import { FAST_DRINK_THRESHOLD, FAST_DRINK_WINDOW_MS } from './constants'

/**
 * Returns true if `threshold` or more drinks were logged within `windowMs`
 * of the most recent drink.
 */
export function detectFastDrinking(
  drinks: DrinkEntry[],
  _atTime: number = Date.now(),
  windowMs: number = FAST_DRINK_WINDOW_MS,
  threshold: number = FAST_DRINK_THRESHOLD,
): boolean {
  if (drinks.length < threshold) return false

  const sorted = [...drinks].sort((a, b) => b.timestamp - a.timestamp)
  const latest = sorted[0].timestamp
  const windowStart = latest - windowMs

  const drinksInWindow = sorted.filter((d) => d.timestamp >= windowStart)
  return drinksInWindow.length >= threshold
}

export function shouldShowFastDrinkingAlert(
  drinks: DrinkEntry[],
  dismissedAt: number | undefined,
  atTime: number = Date.now(),
): boolean {
  if (!detectFastDrinking(drinks, atTime)) return false
  if (!dismissedAt) return true
  const latestDrinkTs = Math.max(...drinks.map((d) => d.timestamp))
  return latestDrinkTs > dismissedAt
}

export function countDrinksInWindow(
  drinks: DrinkEntry[],
  _atTime: number = Date.now(),
  windowMs: number = FAST_DRINK_WINDOW_MS,
): number {
  if (drinks.length === 0) return 0
  const sorted = [...drinks].sort((a, b) => b.timestamp - a.timestamp)
  const latest = sorted[0].timestamp
  const windowStart = latest - windowMs
  return sorted.filter((d) => d.timestamp >= windowStart).length
}
