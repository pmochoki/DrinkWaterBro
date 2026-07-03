import { FOOD_ABSORPTION } from './constants'
import type { FoodIntake } from '../types'

export const PRE_DRINK_FOODS = [
  'Toast or bread with butter',
  'Pasta or rice',
  'Eggs (scrambled, omelette)',
  'Greek yogurt with nuts',
  'Anything with fat + protein',
]

export const PARTY_SNACKS: Record<FoodIntake, string[]> = {
  nothing: [
    'Cheese & crackers',
    'Nuts or trail mix',
    'Pizza slice',
    'Chicken wings',
    'Anything from the appetizer table',
  ],
  snacks: ['Cheese plate', 'Hummus & pita', 'Mixed nuts', 'Slider or mini sandwich'],
  light_meal: ['A few more bites if you can', 'Something salty helps electrolytes'],
  full_meal: ["You're good — just pace yourself and hydrate"],
}

export function getPartySnackTip(foodIntake: FoodIntake): string {
  const snacks = PARTY_SNACKS[foodIntake]
  if (foodIntake === 'full_meal') return snacks[0]
  const pick = snacks[Math.floor(Date.now() / (1000 * 60 * 30)) % snacks.length]
  return `Grab something if you can — ${pick.toLowerCase()} works great.`
}

export function getAbsorptionProfile(foodIntake: FoodIntake | null | undefined) {
  return FOOD_ABSORPTION[foodIntake ?? 'snacks']
}
