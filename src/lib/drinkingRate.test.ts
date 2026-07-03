import { describe, it, expect } from 'vitest'
import { detectFastDrinking, countDrinksInWindow } from './drinkingRate'
import type { DrinkEntry } from '../types'

const now = Date.now()

function drink(minutesAgo: number, id = '1'): DrinkEntry {
  return {
    id,
    name: 'Beer',
    volumeMl: 355,
    abvPercent: 5,
    timestamp: now - minutesAgo * 60 * 1000,
  }
}

describe('detectFastDrinking', () => {
  it('returns false with fewer than 3 drinks', () => {
    expect(detectFastDrinking([drink(10)], now)).toBe(false)
    expect(detectFastDrinking([drink(10), drink(20)], now)).toBe(false)
  })

  it('returns true when 3+ drinks within 45 minutes', () => {
    const drinks = [drink(5, '1'), drink(15, '2'), drink(30, '3')]
    expect(detectFastDrinking(drinks, now)).toBe(true)
  })

  it('returns false when drinks are spread beyond the window', () => {
    const drinks = [drink(5, '1'), drink(20, '2'), drink(55, '3')]
    expect(detectFastDrinking(drinks, now)).toBe(false)
  })
})

describe('countDrinksInWindow', () => {
  it('counts drinks in the rolling window from latest drink', () => {
    const drinks = [drink(5, '1'), drink(15, '2'), drink(30, '3'), drink(60, '4')]
    expect(countDrinksInWindow(drinks, now)).toBe(3)
  })
})
