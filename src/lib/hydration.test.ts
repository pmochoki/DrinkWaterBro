import { describe, it, expect } from 'vitest'
import {
  totalGlasses,
  drinksSinceLastWater,
  shouldRemindHydration,
  waterGlassesRecommended,
} from './hydration'
import type { DrinkEntry, HydrationEntry } from '../types'

const now = Date.now()

function drink(offsetMin: number): DrinkEntry {
  return {
    id: '1',
    name: 'Beer',
    volumeMl: 355,
    abvPercent: 5,
    timestamp: now - offsetMin * 60 * 1000,
  }
}

function water(offsetMin: number): HydrationEntry {
  return { id: 'w1', glasses: 1, timestamp: now - offsetMin * 60 * 1000 }
}

describe('hydration', () => {
  it('totals glasses logged', () => {
    expect(totalGlasses([{ id: '1', glasses: 2, timestamp: now }])).toBe(2)
  })

  it('counts drinks since last water', () => {
    const drinks = [drink(30), drink(20), drink(10)]
    const hydration = [water(25)]
    expect(drinksSinceLastWater(drinks, hydration)).toBe(2)
  })

  it('reminds when 2+ drinks since last water', () => {
    const drinks = [drink(30), drink(20)]
    expect(shouldRemindHydration(drinks, [], undefined, now)).toBe(true)
  })

  it('does not remind right after dismissal', () => {
    const drinks = [drink(30), drink(20)]
    expect(shouldRemindHydration(drinks, [], now - 1000, now)).toBe(false)
  })

  it('recommends water per drink count', () => {
    expect(waterGlassesRecommended(4)).toBe(2)
    expect(waterGlassesRecommended(0)).toBe(0)
  })
})
