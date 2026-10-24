import type { Achievement } from './achievements'

export type Equipment = 'machine' | 'cable' | 'barbell' | 'dumbbell' | 'kettlebell' | 'bodyweight'

export type MuscleGroup =
  | 'Klatka'
  | 'Plecy'
  | 'Barki'
  | 'Biceps'
  | 'Triceps'
  | 'Czworogłowe'
  | 'Dwugłowe uda'
  | 'Pośladki'
  | 'Łydki'
  | 'Core'
  | 'Kondycja'

export type Exercise = {
  id: string
  name: string
  equipment: Equipment
  muscle: MuscleGroup
  compound: boolean
  /** krok zmiany ciężaru w kg (np. 2.5 dla sztangi, 5 dla stosu maszyny) */
  increment: number
  /** ćwiczenie liczone w sekundach zamiast powtórzeń */
  timed?: boolean
  cue?: string
  /** ćwiczenie dodane przez użytkownika (np. konkretna maszyna z jego siłowni) */
  custom?: boolean
  /** ustawienia maszyny, np. "siedzisko 4, oparcie 2" */
  note?: string
  defaultWeight?: number
  defaultSets?: number
  defaultReps?: number
}

export type Goal = 'strength' | 'hypertrophy' | 'fatloss' | 'general'
export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Focus = 'full' | 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'core' | 'custom'

export type SetLog = {
  weight: number
  reps: number
  done: boolean
}

export type WorkoutExercise = {
  exerciseId: string
  sets: number
  repMin: number
  repMax: number
  restSec: number
  suggestedWeight: number | null
  suggestionNote?: string
  log: SetLog[]
}

export type Workout = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  focus: Focus
  goal: Goal
  estMinutes: number
  status: 'planned' | 'done'
  exercises: WorkoutExercise[]
  notes?: string
  rpe?: number
  completedAt?: string
}

export type Sex = 'male' | 'female'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete'
export type BodyGoal = 'cut' | 'maintain' | 'bulk'

export type Profile = {
  name: string
  sex: Sex
  age: number
  heightCm: number
  goalWeightKg: number
  activity: Activity
  bodyGoal: BodyGoal
  daysPerWeek: number
  level: Level
  trainingGoal: Goal
  equipment: Equipment[]
}

export type WeightEntry = { date: string; kg: number }

export type Meal = {
  id: string
  date: string
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export type AppData = {
  version: 1
  profile: Profile
  workouts: Workout[]
  achievements: Achievement[]
  weights: WeightEntry[]
  meals: Meal[]
  customExercises: Exercise[]
}
