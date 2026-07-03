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
    expect(alcoholGrams(355, 5)).toBeCloseTo(14.0, 0)
  })
})

describe('calculateDrinkPeakBAC', () => {
  it('returns expected peak BAC for a standard beer (male, 75kg, snacks default)', () => {
    const drink = makeDrink()
    const peak = calculateDrinkPeakBAC(drink, testProfile)
    // base ~0.0275 × snacks multiplier 1.1 ≈ 0.0303
    expect(peak).toBeCloseTo(0.0303, 2)
  })

  it('uses female Widmark r constant', () => {
    const femaleProfile = { ...testProfile, sex: 'female' as const }
    const drink = makeDrink()
    const malePeak = calculateDrinkPeakBAC(drink, testProfile)
    const femalePeak = calculateDrinkPeakBAC(drink, femaleProfile)
    expect(femalePeak).toBeGreaterThan(malePeak)
  })

  it('raises peak BAC on empty stomach vs full meal', () => {
    const drink = makeDrink()
    const empty = calculateDrinkPeakBAC(drink, testProfile, 'nothing')
    const full = calculateDrinkPeakBAC(drink, testProfile, 'full_meal')
    expect(empty).toBeGreaterThan(full)
  })
})

describe('calculateBAC', () => {
  it('returns 0 with no drinks', () => {
    expect(calculateBAC([], testProfile)).toBe(0)
  })

  it('decreases BAC over time via metabolism after absorption ramp', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
    const drink = makeDrink({ timestamp: twoHoursAgo })
    const peak = calculateDrinkPeakBAC(drink, testProfile, 'snacks')
    const current = calculateBAC([drink], testProfile, Date.now(), 'snacks')
    // 30 min ramp, then 1.5h metabolism at peak
    expect(current).toBeCloseTo(peak - 0.015 * 1.5, 2)
  })

  it('never returns negative BAC', () => {
    const longAgo = Date.now() - 24 * 60 * 60 * 1000
    const drink = makeDrink({ timestamp: longAgo })
    expect(calculateBAC([drink], testProfile)).toBe(0)
  })

  it('sums contributions from multiple drinks after ramp-up', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
    const now = Date.now()
    const drinks = [
      makeDrink({ id: '1', timestamp: twoHoursAgo }),
      makeDrink({ id: '2', timestamp: twoHoursAgo }),
    ]
    const single = calculateBAC([drinks[0]], testProfile, now, 'snacks')
    const double = calculateBAC(drinks, testProfile, now, 'snacks')
    expect(double).toBeCloseTo(single * 2, 4)
  })

  it('ramps up BAC during absorption window on empty stomach', () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    const drink = makeDrink({ timestamp: fiveMinAgo })
    const peak = calculateDrinkPeakBAC(drink, testProfile, 'nothing')
    const current = calculateBAC([drink], testProfile, Date.now(), 'nothing')
    // 5 min into 15 min ramp → ~33% of peak
    expect(current).toBeCloseTo(peak * (5 / 15), 2)
    expect(current).toBeLessThan(peak)
  })

  it('dampens BAC with a full meal vs empty stomach at same time', () => {
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000
    const drink = makeDrink({ timestamp: thirtyMinAgo })
    const empty = calculateBAC([drink], testProfile, Date.now(), 'nothing')
    const full = calculateBAC([drink], testProfile, Date.now(), 'full_meal')
    expect(empty).toBeGreaterThan(full)
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
