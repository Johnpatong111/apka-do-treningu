import { workoutVolume } from './calc'
import type { Workout } from './types'

export type AchievementCategory = 'milestone' | 'consistency' | 'volume'
export type AchievementIcon = 'dumbbell' | 'flame' | 'medal' | 'trophy' | 'award'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: AchievementIcon
  category: AchievementCategory
  isUnlocked: boolean
  unlockedAt: string | null
}

type AchievementDefinition = Omit<Achievement, 'isUnlocked' | 'unlockedAt'>

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-workout',
    title: 'Pierwszy trening',
    description: 'Ukończ swój pierwszy trening.',
    icon: 'dumbbell',
    category: 'milestone',
  },
  {
    id: 'five-workouts',
    title: 'Żelazna konsekwencja',
    description: 'Ukończ 5 treningów.',
    icon: 'flame',
    category: 'consistency',
  },
  {
    id: 'ten-workouts',
    title: 'Stały bywalec',
    description: 'Ukończ 10 treningów.',
    icon: 'medal',
    category: 'consistency',
  },
  {
    id: 'volume-10000',
    title: 'Pogromca ciężarów',
    description: 'Podnieś łącznie 10 000 kg podczas ukończonych treningów.',
    icon: 'trophy',
    category: 'volume',
  },
  {
    id: 'volume-50000',
    title: 'Tytan siłowni',
    description: 'Podnieś łącznie 50 000 kg podczas ukończonych treningów.',
    icon: 'award',
    category: 'volume',
  },
]

function earnedAtFor(achievementId: string, workouts: Workout[]): string | null {
  const completed = workouts
    .filter((workout) => workout.status === 'done')
    .sort((a, b) => {
      const aTime = a.completedAt ?? a.date
      const bTime = b.completedAt ?? b.date
      return aTime.localeCompare(bTime)
    })

  if (achievementId === 'first-workout') {
    return completed[0]?.completedAt ?? completed[0]?.date ?? null
  }

  if (achievementId === 'five-workouts' || achievementId === 'ten-workouts') {
    const threshold = achievementId === 'five-workouts' ? 5 : 10
    const workout = completed[threshold - 1]
    return workout?.completedAt ?? workout?.date ?? null
  }

  if (achievementId === 'volume-10000' || achievementId === 'volume-50000') {
    const threshold = achievementId === 'volume-10000' ? 10_000 : 50_000
    let volume = 0
    for (const workout of completed) {
      volume += workoutVolume(workout)
      if (volume >= threshold) return workout.completedAt ?? workout.date
    }
  }

  return null
}

export function checkAchievements(
  workouts: Workout[],
  previousAchievements: Achievement[] = [],
): Achievement[] {
  const previousById = new Map(previousAchievements.map((item) => [item.id, item]))

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const previous = previousById.get(definition.id)
    const earnedAt = earnedAtFor(definition.id, workouts)
    const isUnlocked = earnedAt !== null

    return {
      ...definition,
      isUnlocked,
      unlockedAt: isUnlocked
        ? previous?.isUnlocked && previous.unlockedAt
          ? previous.unlockedAt
          : earnedAt
        : null,
    }
  })
}
