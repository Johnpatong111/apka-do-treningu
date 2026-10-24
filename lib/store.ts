'use client'

import { useSyncExternalStore } from 'react'
import { checkAchievements } from './achievements'
import { setCustomExercises } from './exercises'
import type { AppData, Exercise, Meal, Profile, WeightEntry, Workout } from './types'

/**
 * Tymczasowa warstwa danych w przeglądarce – wszystkie operacje przechodzą przez
 * funkcje poniżej, więc przejście na Supabase wymaga podmiany tylko tego modułu.
 */
const STORAGE_KEY = 'forma-online:v1'

export const DEFAULT_PROFILE: Profile = {
  name: '',
  sex: 'male',
  age: 30,
  heightCm: 175,
  goalWeightKg: 72,
  activity: 'moderate',
  bodyGoal: 'cut',
  daysPerWeek: 4,
  level: 'beginner',
  trainingGoal: 'hypertrophy',
  equipment: ['machine', 'cable', 'dumbbell', 'bodyweight'],
}

const DEFAULT_DATA: AppData = {
  version: 1,
  profile: DEFAULT_PROFILE,
  workouts: [],
  achievements: checkAchievements([]),
  weights: [],
  meals: [],
  customExercises: [],
}

let cache: AppData | null = null
const listeners = new Set<() => void>()

function normalize(data: Partial<AppData>): AppData {
  return {
    ...DEFAULT_DATA,
    ...data,
    profile: { ...DEFAULT_PROFILE, ...data.profile },
    workouts: data.workouts ?? [],
    achievements: checkAchievements(data.workouts ?? [], data.achievements ?? []),
    customExercises: data.customExercises ?? [],
  }
}

function load(): AppData {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      cache = normalize(JSON.parse(raw) as AppData)
      setCustomExercises(cache.customExercises)
      return cache
    }
  } catch {
    // uszkodzone dane – zaczynamy od czystego stanu
  }
  cache = DEFAULT_DATA
  return cache
}

function commit(next: AppData) {
  cache = next
  setCustomExercises(next.customExercises)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // brak miejsca / tryb prywatny – dane zostaną w pamięci sesji
  }
  listeners.forEach((l) => l())
}

function update(fn: (d: AppData) => AppData) {
  commit(fn(load()))
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null
      cb()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, load, () => DEFAULT_DATA)
}

const noopSubscribe = () => () => {}
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

export const actions = {
  updateProfile(patch: Partial<Profile>) {
    update((d) => ({ ...d, profile: { ...d.profile, ...patch } }))
  },
  saveWorkout(w: Workout) {
    update((d) => {
      const exists = d.workouts.some((x) => x.id === w.id)
      const workouts = exists ? d.workouts.map((x) => (x.id === w.id ? w : x)) : [...d.workouts, w]
      return { ...d, workouts, achievements: checkAchievements(workouts, d.achievements) }
    })
  },
  deleteWorkout(id: string) {
    update((d) => {
      const workouts = d.workouts.filter((w) => w.id !== id)
      return { ...d, workouts, achievements: checkAchievements(workouts, d.achievements) }
    })
  },
  addWeight(entry: WeightEntry) {
    update((d) => ({
      ...d,
      weights: [...d.weights.filter((w) => w.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)),
    }))
  },
  deleteWeight(date: string) {
    update((d) => ({ ...d, weights: d.weights.filter((w) => w.date !== date) }))
  },
  addMeal(meal: Meal) {
    update((d) => ({ ...d, meals: [...d.meals, meal] }))
  },
  deleteMeal(id: string) {
    update((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }))
  },
  saveCustomExercise(ex: Exercise) {
    const next = { ...ex, custom: true }
    update((d) => {
      const exists = d.customExercises.some((x) => x.id === ex.id)
      return {
        ...d,
        customExercises: exists ? d.customExercises.map((x) => (x.id === ex.id ? next : x)) : [next, ...d.customExercises],
      }
    })
  },
  deleteCustomExercise(id: string) {
    update((d) => ({ ...d, customExercises: d.customExercises.filter((x) => x.id !== id) }))
  },
  importData(data: AppData) {
    commit(normalize(data))
  },
  reset() {
    commit(DEFAULT_DATA)
  },
}

export function currentWeight(d: AppData): number | null {
  return d.weights.at(-1)?.kg ?? null
}
