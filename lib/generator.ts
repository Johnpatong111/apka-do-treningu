import { EXERCISES, FOCUS_LABELS, FOCUS_SLOTS, getExercise } from './exercises'
import { exerciseHistory, initLog, suggestNext } from './progression'
import type { Equipment, Exercise, Focus, Goal, Level, Workout, WorkoutExercise } from './types'

export type GeneratorParams = {
  goal: Goal
  level: Level
  focus: Focus
  equipment: Equipment[]
  minutes: number
  date: string
  preferMachines: boolean
}

export const GOAL_LABELS: Record<Goal, string> = {
  strength: 'Siła',
  hypertrophy: 'Budowa mięśni',
  fatloss: 'Redukcja / kondycja',
  general: 'Ogólna sprawność',
}

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Początkujący',
  intermediate: 'Średniozaawansowany',
  advanced: 'Zaawansowany',
}

type Scheme = { sets: number; repMin: number; repMax: number; restSec: number }

function scheme(goal: Goal, level: Level, ex: Exercise): Scheme {
  const base: Record<Goal, { compound: Scheme; isolation: Scheme }> = {
    strength: { compound: { sets: 4, repMin: 4, repMax: 6, restSec: 150 }, isolation: { sets: 3, repMin: 8, repMax: 12, restSec: 90 } },
    hypertrophy: { compound: { sets: 3, repMin: 6, repMax: 10, restSec: 120 }, isolation: { sets: 3, repMin: 10, repMax: 15, restSec: 75 } },
    fatloss: { compound: { sets: 3, repMin: 10, repMax: 15, restSec: 60 }, isolation: { sets: 3, repMin: 12, repMax: 20, restSec: 45 } },
    general: { compound: { sets: 3, repMin: 8, repMax: 12, restSec: 90 }, isolation: { sets: 3, repMin: 10, repMax: 15, restSec: 60 } },
  }
  const s = { ...(ex.compound ? base[goal].compound : base[goal].isolation) }
  if (level === 'beginner') s.sets = Math.max(2, s.sets - (ex.compound ? 1 : 1))
  if (level === 'advanced' && ex.compound) s.sets += 1
  if (ex.timed) return { sets: s.sets, repMin: 20, repMax: 45, restSec: 60 }
  if (ex.equipment === 'bodyweight' && ex.compound && goal === 'strength') return { ...s, repMin: 5, repMax: 10 }
  return s
}

/** szacowany czas ćwiczenia w minutach: praca + przerwy + przejście */
function exerciseMinutes(s: Scheme): number {
  return (s.sets * (40 + s.restSec) + 60) / 60
}

function pickExercise(
  slot: { muscle: Exercise['muscle']; compound?: boolean },
  params: GeneratorParams,
  used: Set<string>,
  familiar: Set<string>,
): Exercise | undefined {
  const candidates = EXERCISES.filter(
    (e) =>
      e.muscle === slot.muscle &&
      params.equipment.includes(e.equipment) &&
      !used.has(e.id) &&
      (slot.compound === undefined || e.compound === slot.compound),
  )
  if (candidates.length === 0) return undefined
  const scored = candidates.map((e) => {
    let score = Math.random()
    if (familiar.has(e.id)) score += 0.6
    if (params.preferMachines && (e.equipment === 'machine' || e.equipment === 'cable')) score += 0.8
    if (params.level === 'beginner' && e.equipment === 'barbell' && e.compound) score -= 0.4
    return { e, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0].e
}

export function buildExercise(exerciseId: string, goal: Goal, level: Level, history: Workout[]): WorkoutExercise {
  const ex = getExercise(exerciseId)!
  const s = scheme(goal, level, ex)
  const suggestion = suggestNext(history, ex.id, s)
  const we: WorkoutExercise = {
    exerciseId: ex.id,
    ...s,
    suggestedWeight: suggestion.weight,
    suggestionNote: suggestion.note,
    log: [],
  }
  we.log = initLog(we)
  return we
}

/**
 * Ćwiczenie do własnego treningu: domyślnie powtarza ostatni wykonany wynik (ciężar × powt. × serie),
 * żeby na siłowni wystarczyło go tylko odhaczyć. Bez historii – wartości domyślne ćwiczenia.
 */
export function buildManualExercise(exerciseId: string, history: Workout[]): WorkoutExercise {
  const ex = getExercise(exerciseId)!
  const last = exerciseHistory(history, ex.id).at(-1)
  const restSec = ex.timed ? 60 : ex.compound ? 120 : 75
  const usesWeight = ex.increment > 0

  if (last) {
    const sets = Math.max(1, last.sets.length)
    const reps = last.topReps
    const weight = usesWeight ? last.topWeight : null
    const progression = suggestNext(history, ex.id, { sets, repMin: reps, repMax: reps })
    const summary = usesWeight ? `${weight} kg · ${sets}×${reps}` : `${sets}×${reps} ${ex.timed ? 's' : 'powt.'}`
    const ready = usesWeight && progression.weight !== null && weight !== null && progression.weight > weight
    const we: WorkoutExercise = {
      exerciseId: ex.id,
      sets,
      repMin: reps,
      repMax: reps,
      restSec,
      suggestedWeight: weight,
      suggestionNote: ready ? `Ostatnio ${summary}. Wszystko zrobione – możesz spróbować ${progression.weight} kg.` : `Ostatnio ${summary}.`,
      log: [],
    }
    we.log = initLog(we)
    return we
  }

  const sets = ex.defaultSets ?? 3
  const reps = ex.defaultReps ?? (ex.timed ? 30 : 10)
  const we: WorkoutExercise = {
    exerciseId: ex.id,
    sets,
    repMin: reps,
    repMax: reps,
    restSec,
    suggestedWeight: usesWeight ? (ex.defaultWeight ?? null) : null,
    log: [],
  }
  we.log = initLog(we)
  return we
}

export function generateWorkout(params: GeneratorParams, history: Workout[]): Workout {
  const familiar = new Set(
    EXERCISES.filter((e) => exerciseHistory(history, e.id).length > 0).map((e) => e.id),
  )
  const budget = Math.max(12, params.minutes - 8) // 8 min na rozgrzewkę i schłodzenie
  const used = new Set<string>()
  const exercises: WorkoutExercise[] = []
  let total = 0

  const slots = FOCUS_SLOTS[params.focus]
  for (const slot of slots) {
    let ex = pickExercise(slot, params, used, familiar)
    if (!ex && slot.compound !== undefined) ex = pickExercise({ muscle: slot.muscle }, params, used, familiar)
    if (!ex) continue
    const s = scheme(params.goal, params.level, ex)
    const t = exerciseMinutes(s)
    if (exercises.length >= 3 && total + t > budget) break
    used.add(ex.id)
    exercises.push(buildExercise(ex.id, params.goal, params.level, history))
    total += t
  }

  return {
    id: crypto.randomUUID(),
    date: params.date,
    title: `${FOCUS_LABELS[params.focus]} · ${GOAL_LABELS[params.goal]}`,
    focus: params.focus,
    goal: params.goal,
    estMinutes: Math.round(total + 8),
    status: 'planned',
    exercises,
  }
}

/** Zamiana ćwiczenia na inne dla tej samej partii i dostępnego sprzętu */
export function alternativesFor(exerciseId: string, equipment: Equipment[], exclude: string[]): Exercise[] {
  const ex = getExercise(exerciseId)
  if (!ex) return []
  return EXERCISES.filter(
    (e) => e.muscle === ex.muscle && equipment.includes(e.equipment) && e.id !== ex.id && !exclude.includes(e.id),
  )
}

export function estimateMinutes(w: Workout): number {
  return Math.round(
    w.exercises.reduce((s, e) => s + exerciseMinutes({ sets: e.sets, repMin: e.repMin, repMax: e.repMax, restSec: e.restSec }), 0) + 8,
  )
}
