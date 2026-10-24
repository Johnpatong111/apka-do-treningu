import type { SetLog, Workout } from './types'

/** Szacowany 1RM – wzór Epleya, dla 1 powtórzenia zwraca ciężar */
export function e1rm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export function roundTo(value: number, step: number): number {
  if (step <= 0) return Math.round(value * 10) / 10
  return Math.round(value / step) * step
}

export function setVolume(s: SetLog): number {
  return s.done ? s.weight * s.reps : 0
}

export function workoutVolume(w: Workout): number {
  return w.exercises.reduce((sum, ex) => sum + ex.log.reduce((s, set) => s + setVolume(set), 0), 0)
}

export function completedSets(w: Workout): number {
  return w.exercises.reduce((sum, ex) => sum + ex.log.filter((s) => s.done).length, 0)
}

export function formatKg(v: number, digits = 1): string {
  return v.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: digits })
}
