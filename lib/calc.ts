import type { Activity, BodyGoal, Profile, SetLog, Workout } from './types'

/** Szacowany 1RM – wzór Epleya, dla 1 powtórzenia zwraca ciężar */
export function e1rm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

/** Ciężar dla zadanej liczby powtórzeń na podstawie 1RM (odwrócony Epley) */
export function weightForReps(oneRm: number, reps: number): number {
  if (reps <= 1) return oneRm
  return oneRm / (1 + reps / 30)
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

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9,
}

export const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: 'Siedząca (praca biurowa, mało ruchu)',
  light: 'Lekka (1–3 treningi / tydz.)',
  moderate: 'Umiarkowana (3–5 treningów / tydz.)',
  high: 'Wysoka (6–7 treningów / tydz.)',
  athlete: 'Bardzo wysoka (praca fizyczna + treningi)',
}

export const BODY_GOAL_LABELS: Record<BodyGoal, string> = {
  cut: 'Redukcja',
  maintain: 'Utrzymanie',
  bulk: 'Budowa masy',
}

/** Mifflin–St Jeor */
export function bmr(p: Profile, weightKg: number): number {
  const base = 10 * weightKg + 6.25 * p.heightCm - 5 * p.age
  return p.sex === 'male' ? base + 5 : base - 161
}

export function tdee(p: Profile, weightKg: number): number {
  return bmr(p, weightKg) * ACTIVITY_FACTOR[p.activity]
}

export type NutritionTargets = {
  bmr: number
  tdee: number
  kcal: number
  protein: number
  fat: number
  carbs: number
}

export function nutritionTargets(p: Profile, weightKg: number): NutritionTargets {
  const b = bmr(p, weightKg)
  const t = tdee(p, weightKg)
  const adjust = p.bodyGoal === 'cut' ? 0.8 : p.bodyGoal === 'bulk' ? 1.1 : 1
  const floor = p.sex === 'male' ? 1500 : 1200
  const kcal = Math.max(floor, Math.round((t * adjust) / 10) * 10)
  const proteinPerKg = p.bodyGoal === 'cut' ? 2.2 : p.bodyGoal === 'bulk' ? 1.8 : 1.8
  const protein = Math.round(weightKg * proteinPerKg)
  const fat = Math.round((kcal * 0.27) / 9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { bmr: Math.round(b), tdee: Math.round(t), kcal, protein, fat, carbs }
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  return weightKg / (m * m)
}

const BAR_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]

/** Rozkład talerzy na jedną stronę sztangi */
export function platesPerSide(total: number, bar = 20): { plates: number[]; remainder: number } {
  let perSide = Math.max(0, (total - bar) / 2)
  const plates: number[] = []
  for (const p of BAR_PLATES) {
    while (perSide >= p - 1e-9) {
      plates.push(p)
      perSide -= p
    }
  }
  return { plates, remainder: Math.round(perSide * 2 * 100) / 100 }
}

export function formatKg(v: number, digits = 1): string {
  return v.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: digits })
}
