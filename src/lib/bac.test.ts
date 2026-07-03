import { describe, it, expect } from 'vitest'
import {
  alcoholGrams,
  calculateBAC,
  calculateDrinkPeakBAC,
  getZone,
  timeToNextZoneDown,
  bacGaugePosition,
} from './bac'
import type { DrinkEntry, UserProfile } from '../types'

const testProfile: UserProfile = {
  weight: 75,
  weightUnit: 'kg',
  heightCm: 175,
  age: 30,
  sex: 'male',
  workTomorrow: false,
  metabolismRate: 0.015,
}

function makeDrink(overrides: Partial<DrinkEntry> = {}): DrinkEntry {
  return {
    id: '1',
    name: 'Beer',
    volumeMl: 355,
    abvPercent: 5,
    timestamp: Date.now(),
    ...overrides,
  }
}

describe('alcoholGrams', () => {
  it('calculates ethanol mass from volume and ABV', () => {
    // 355ml * 5% * 0.789 ≈ 14.0g
    expect(alcoholGrams(355, 5)).toBeCloseTo(14.0, 0)
  })
})

describe('calculateDrinkPeakBAC', () => {
  it('returns expected peak BAC for a standard beer (male, 75kg)', () => {
    const drink = makeDrink()
    const peak = calculateDrinkPeakBAC(drink, testProfile)
    // 355 * 0.05 * 0.789 ≈ 14g / (75kg * 0.68 * 10) ≈ 0.0275
    expect(peak).toBeCloseTo(0.0275, 2)
  })

  it('uses female Widmark r constant', () => {
    const femaleProfile = { ...testProfile, sex: 'female' as const }
    const drink = makeDrink()
    const malePeak = calculateDrinkPeakBAC(drink, testProfile)
    const femalePeak = calculateDrinkPeakBAC(drink, femaleProfile)
    expect(femalePeak).toBeGreaterThan(malePeak)
  })
})

describe('calculateBAC', () => {
  it('returns 0 with no drinks', () => {
    expect(calculateBAC([], testProfile)).toBe(0)
  })

  it('decreases BAC over time via metabolism', () => {
    const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000
    const drink = makeDrink({ timestamp: oneHourAgo })
    const peak = calculateDrinkPeakBAC(drink, testProfile)
    const current = calculateBAC([drink], testProfile)
    expect(current).toBeCloseTo(peak - 0.015, 2)
  })

  it('never returns negative BAC', () => {
    const longAgo = Date.now() - 24 * 60 * 60 * 1000
    const drink = makeDrink({ timestamp: longAgo })
    expect(calculateBAC([drink], testProfile)).toBe(0)
  })

  it('sums contributions from multiple drinks', () => {
    const now = Date.now()
    const drinks = [
      makeDrink({ id: '1', timestamp: now }),
      makeDrink({ id: '2', timestamp: now }),
    ]
    const single = calculateBAC([drinks[0]], testProfile, now)
    const double = calculateBAC(drinks, testProfile, now)
    expect(double).toBeCloseTo(single * 2, 4)
  })
})

describe('getZone', () => {
  it('classifies BAC into correct zones', () => {
    expect(getZone(0).zone).toBe('sober')
    expect(getZone(0.01).zone).toBe('sober')
    expect(getZone(0.03).zone).toBe('buzzed')
    expect(getZone(0.06).zone).toBe('impaired')
    expect(getZone(0.1).zone).toBe('danger')
  })
})

describe('timeToNextZoneDown', () => {
  it('returns time to drop from impaired to buzzed', () => {
    const result = timeToNextZoneDown(0.065, 0.015)
    expect(result).not.toBeNull()
    expect(result!.zone.zone).toBe('buzzed')
    // (0.065 - 0.05) / 0.015 hours = 1 hour
    expect(result!.ms).toBeCloseTo(60 * 60 * 1000, -3)
  })

  it('returns null when already sober', () => {
    expect(timeToNextZoneDown(0.01)).toBeNull()
  })
})

describe('bacGaugePosition', () => {
  it('maps BAC to 0-100 scale', () => {
    expect(bacGaugePosition(0)).toBe(0)
    expect(bacGaugePosition(0.08)).toBe(50)
    expect(bacGaugePosition(0.16)).toBe(100)
    expect(bacGaugePosition(0.32)).toBe(100)
  })
})
