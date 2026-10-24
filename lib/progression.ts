import { e1rm, roundTo } from './calc'
import { getExercise } from './exercises'
import type { Workout, WorkoutExercise } from './types'

export type ExerciseSession = {
  date: string
  workoutId: string
  topWeight: number
  topReps: number
  bestE1rm: number
  volume: number
  sets: { weight: number; reps: number }[]
  target: { sets: number; repMin: number; repMax: number }
}

/** Historia wykonanych serii danego ćwiczenia – od najstarszej */
export function exerciseHistory(workouts: Workout[], exerciseId: string): ExerciseSession[] {
  return workouts
    .filter((w) => w.status === 'done')
    .sort((a, b) => a.date.localeCompare(b.date) || (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
    .flatMap((w) => {
      const we = w.exercises.find((e) => e.exerciseId === exerciseId)
      if (!we) return []
      const done = we.log.filter((s) => s.done && s.reps > 0)
      if (done.length === 0) return []
      let best = done[0]
      let bestE = -1
      for (const s of done) {
        const v = e1rm(s.weight, s.reps)
        if (v > bestE || (v === bestE && s.reps > best.reps)) {
          bestE = v
          best = s
        }
      }
      return [
        {
          date: w.date,
          workoutId: w.id,
          topWeight: best.weight,
          topReps: best.reps,
          bestE1rm: Math.max(0, bestE),
          volume: done.reduce((s, x) => s + x.weight * x.reps, 0),
          sets: done.map((s) => ({ weight: s.weight, reps: s.reps })),
          target: { sets: we.sets, repMin: we.repMin, repMax: we.repMax },
        },
      ]
    })
}

/** Ćwiczenia z co najmniej jedną wykonaną serią, od najczęściej trenowanych */
export function trainedExerciseIds(workouts: Workout[]): string[] {
  const counts = new Map<string, number>()
  for (const w of workouts) {
    if (w.status !== 'done') continue
    for (const e of w.exercises) {
      if (e.log.some((s) => s.done)) counts.set(e.exerciseId, (counts.get(e.exerciseId) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
}

/** Ostatnia wykonana sesja każdego ćwiczenia – do szybkiego podglądu w wyborze ćwiczeń */
export function lastSessions(workouts: Workout[]): Map<string, ExerciseSession> {
  const map = new Map<string, ExerciseSession>()
  for (const id of trainedExerciseIds(workouts)) {
    const last = exerciseHistory(workouts, id).at(-1)
    if (last) map.set(id, last)
  }
  return map
}

export type Suggestion = { weight: number | null; note: string }

/**
 * Podwójna progresja: gdy wszystkie serie robocze osiągnęły górę zakresu – dokładamy ciężar,
 * gdy średnio wypadamy poniżej dołu zakresu – lekko odejmujemy, w pozostałych przypadkach
 * zostajemy przy ciężarze i dokładamy powtórzenia.
 */
export function suggestNext(
  workouts: Workout[],
  exerciseId: string,
  target: { sets: number; repMin: number; repMax: number },
): Suggestion {
  const exercise = getExercise(exerciseId)
  const history = exerciseHistory(workouts, exerciseId)
  const last = history.at(-1)
  const inc = exercise?.increment ?? 2.5
  const unit = exercise?.timed ? 's' : 'powt.'

  if (!last) {
    if (inc === 0) return { weight: null, note: `Pierwszy raz: zrób ${target.repMin}–${target.repMax} ${unit} technicznie.` }
    return { weight: null, note: 'Pierwszy raz: dobierz ciężar tak, by zostały 2–3 powt. w zapasie.' }
  }

  const workSets = last.sets.filter((s) => s.weight >= last.topWeight * 0.9)
  const allTop = workSets.length >= target.sets && workSets.every((s) => s.reps >= target.repMax)
  const avgReps = workSets.reduce((s, x) => s + x.reps, 0) / Math.max(1, workSets.length)

  if (inc === 0) {
    if (allTop) return { weight: null, note: `Ostatnio ${last.topReps} ${unit} – podnieś zakres o 1–2 ${unit} lub dodaj obciążenie.` }
    return { weight: null, note: `Ostatnio najlepsza seria: ${last.topReps} ${unit}. Spróbuj o 1 więcej.` }
  }

  if (allTop) {
    const next = roundTo(last.topWeight + inc, inc)
    return { weight: next, note: `Wszystkie serie na ${target.repMax} powt. – dokładamy ${inc} kg.` }
  }
  if (avgReps < target.repMin) {
    const next = Math.max(inc, roundTo(last.topWeight * 0.93, inc))
    return { weight: next, note: `Ostatnio poniżej ${target.repMin} powt. – lżej, popraw technikę.` }
  }
  return { weight: last.topWeight, note: `Zostań przy ${last.topWeight} kg i dołóż powtórzenia (cel: ${target.repMax}).` }
}

export function initLog(ex: Pick<WorkoutExercise, 'sets' | 'suggestedWeight'>) {
  return Array.from({ length: ex.sets }, () => ({ weight: ex.suggestedWeight ?? 0, reps: 0, done: false }))
}

export type PersonalRecord = { exerciseId: string; date: string; weight: number; reps: number; e1rm: number }

export function personalRecords(workouts: Workout[]): PersonalRecord[] {
  return trainedExerciseIds(workouts)
    .map((id) => {
      const h = exerciseHistory(workouts, id)
      const best = h.reduce<ExerciseSession | null>((b, s) => (!b || s.bestE1rm > b.bestE1rm ? s : b), null)
      if (!best || best.bestE1rm <= 0) return null
      return { exerciseId: id, date: best.date, weight: best.topWeight, reps: best.topReps, e1rm: best.bestE1rm }
    })
    .filter((x): x is PersonalRecord => x !== null)
}
