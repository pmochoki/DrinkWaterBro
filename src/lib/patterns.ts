import type { CompletedSession } from '../types'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const DANGER_THRESHOLD = 4
const FREQUENT_NIGHTS = 4

export interface PatternInsight {
  show: boolean
  message: string
}

export function detectDrinkingPatterns(
  history: CompletedSession[],
  patternFlagShownAt: number | undefined,
  now: number = Date.now(),
): PatternInsight {
  if (patternFlagShownAt && now - patternFlagShownAt < WEEK_MS) {
    return { show: false, message: '' }
  }

  const recent = history.filter((s) => now - s.endedAt < WEEK_MS)
  if (recent.length < 3) return { show: false, message: '' }

  const dangerSessions = recent.filter((s) => s.peakZone === 'danger').length
  const nights = new Set(
    recent.map((s) => new Date(s.endedAt).toDateString()),
  ).size

  if (dangerSessions >= DANGER_THRESHOLD) {
    return {
      show: true,
      message:
        "Hey, we've noticed you've hit the Danger zone a few times this week. That's not a judgment — just something worth paying attention to. Want some resources, or just someone to talk to?",
    }
  }

  if (nights >= FREQUENT_NIGHTS) {
    return {
      show: true,
      message:
        "We've noticed you've been out drinking most nights this week. That's not a lecture — just a friend noticing. If it ever feels like too much, there are people who can help.",
    }
  }

  return { show: false, message: '' }
}

export const SUPPORT_RESOURCES: Record<string, { name: string; url: string }[]> = {
  US: [
    { name: 'SAMHSA Helpline', url: 'https://www.samhsa.gov/find-help/national-helpline' },
    { name: 'AA Meeting Finder', url: 'https://www.aa.org/find-aa' },
  ],
  UK: [
    { name: 'Drinkaware', url: 'https://www.drinkaware.co.uk/' },
    { name: 'Alcoholics Anonymous UK', url: 'https://www.alcoholics-anonymous.org.uk/' },
  ],
  default: [
    { name: 'Drinkaware', url: 'https://www.drinkaware.co.uk/' },
    { name: 'WHO Alcohol Resources', url: 'https://www.who.int/health-topics/alcohol' },
  ],
}

export function getResources(country?: string) {
  if (!country) return SUPPORT_RESOURCES.default
  return SUPPORT_RESOURCES[country] ?? SUPPORT_RESOURCES.default
}
