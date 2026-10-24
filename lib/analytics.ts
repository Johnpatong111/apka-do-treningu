import { workoutVolume } from './calc'
import { addDays, daysBetween, formatShort, startOfWeek, todayISO } from './dates'
import { getExercise } from './exercises'
import type { MuscleGroup, Workout } from './types'

export function doneWorkouts(workouts: Workout[]): Workout[] {
  return workouts.filter((w) => w.status === 'done')
}

export function weeklyVolume(workouts: Workout[], weeks = 8) {
  const thisWeek = startOfWeek(todayISO())
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisWeek, -7 * (weeks - 1 - i))
    const end = addDays(start, 7)
    const ws = doneWorkouts(workouts).filter((w) => w.date >= start && w.date < end)
    return {
      label: formatShort(start),
      volume: Math.round(ws.reduce((s, w) => s + workoutVolume(w), 0)),
      sessions: ws.length,
    }
  })
}

export function muscleSets(workouts: Workout[], days = 30) {
  const from = addDays(todayISO(), -days)
  const counts = new Map<MuscleGroup, number>()
  for (const w of doneWorkouts(workouts)) {
    if (w.date < from) continue
    for (const e of w.exercises) {
      const ex = getExercise(e.exerciseId)
      if (!ex) continue
      const n = e.log.filter((s) => s.done).length
      if (n) counts.set(ex.muscle, (counts.get(ex.muscle) ?? 0) + n)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label, sets]) => ({ label, sets }))
}

/** Liczba kolejnych tygodni (wstecz od bieżącego) z co najmniej jednym treningiem */
export function weekStreak(workouts: Workout[]): number {
  const weeks = new Set(doneWorkouts(workouts).map((w) => startOfWeek(w.date)))
  let cursor = startOfWeek(todayISO())
  if (!weeks.has(cursor)) cursor = addDays(cursor, -7)
  let streak = 0
  while (weeks.has(cursor)) {
    streak++
    cursor = addDays(cursor, -7)
  }
  return streak
}

export function sessionsThisWeek(workouts: Workout[]): number {
  const start = startOfWeek(todayISO())
  return doneWorkouts(workouts).filter((w) => w.date >= start && w.date <= addDays(start, 6)).length
}

export function daysSinceLast(workouts: Workout[]): number | null {
  const last = doneWorkouts(workouts).map((w) => w.date).sort().at(-1)
  return last ? daysBetween(last, todayISO()) : null
}
