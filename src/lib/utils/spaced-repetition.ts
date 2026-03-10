/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 *
 * Quality ratings:
 * 0 - Complete blackout
 * 1 - Incorrect; correct answer remembered after seeing it
 * 2 - Incorrect; correct answer seemed easy to recall
 * 3 - Correct but with difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response
 */

interface SM2Result {
  easinessFactor: number
  intervalDays: number
  repetitionNumber: number
  nextReviewDate: Date
}

export function calculateSM2(
  quality: number, // 0-5
  currentEasinessFactor: number,
  currentRepetition: number,
  currentInterval: number
): SM2Result {
  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, quality))

  let newEF = currentEasinessFactor
  let newRepetition = currentRepetition
  let newInterval = currentInterval

  if (quality >= 3) {
    // Correct response
    if (currentRepetition === 0) {
      newInterval = 1
    } else if (currentRepetition === 1) {
      newInterval = 3 // Review after 3 days instead of 6 (more aggressive for exam prep)
    } else {
      newInterval = Math.round(currentInterval * currentEasinessFactor)
    }
    newRepetition = currentRepetition + 1
  } else {
    // Incorrect response - reset
    newRepetition = 0
    newInterval = 1
  }

  // Update easiness factor
  newEF =
    currentEasinessFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  // Minimum EF is 1.3
  newEF = Math.max(1.3, newEF)

  // Cap interval at 60 days for exam prep (don't want gaps > 2 months)
  newInterval = Math.min(60, newInterval)

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    easinessFactor: Math.round(newEF * 100) / 100,
    intervalDays: newInterval,
    repetitionNumber: newRepetition,
    nextReviewDate,
  }
}

/**
 * Convert a student's self-assessment to SM-2 quality
 */
export function assessmentToQuality(assessment: 'forgot' | 'hard' | 'good' | 'easy'): number {
  switch (assessment) {
    case 'forgot':
      return 1
    case 'hard':
      return 3
    case 'good':
      return 4
    case 'easy':
      return 5
  }
}
