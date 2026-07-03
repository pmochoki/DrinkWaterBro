export const DRINK_PRESETS = [
  { type: 'Beer', volumeMl: 355, abvPercent: 5 },
  { type: 'Light Beer', volumeMl: 355, abvPercent: 4.2 },
  { type: 'Wine (glass)', volumeMl: 150, abvPercent: 12 },
  { type: 'Champagne', volumeMl: 150, abvPercent: 12 },
  { type: 'Cocktail', volumeMl: 200, abvPercent: 15 },
  { type: 'Shot', volumeMl: 44, abvPercent: 40 },
  { type: 'Hard Seltzer', volumeMl: 355, abvPercent: 5 },
  { type: 'Cider', volumeMl: 355, abvPercent: 5.5 },
  { type: 'Whiskey (neat)', volumeMl: 44, abvPercent: 40 },
  { type: 'Custom', volumeMl: 0, abvPercent: 0 },
] as const

export const FOOD_PRESETS = [
  { description: 'Light snack', level: 'light' as const },
  { description: 'Full meal', level: 'full' as const },
  { description: 'Heavy meal', level: 'full' as const },
]

export const WATER_AMOUNTS = [250, 500, 750] as const
