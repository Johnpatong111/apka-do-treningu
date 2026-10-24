import type { Equipment, Exercise, Focus, MuscleGroup } from './types'

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  machine: 'Maszyny',
  cable: 'Wyciągi',
  barbell: 'Sztanga',
  dumbbell: 'Hantle',
  kettlebell: 'Kettlebell',
  bodyweight: 'Masa ciała',
}

const ex = (
  id: string,
  name: string,
  equipment: Equipment,
  muscle: MuscleGroup,
  compound: boolean,
  increment: number,
  extra: Partial<Exercise> = {},
): Exercise => ({ id, name, equipment, muscle, compound, increment, ...extra })

export const EXERCISES: Exercise[] = [
  // Maszyny
  ex('leg-press', 'Suwnica (leg press)', 'machine', 'Czworogłowe', true, 10, { cue: 'Stopy na szerokość bioder, nie odrywaj lędźwi od oparcia.' }),
  ex('hack-squat', 'Hack squat na maszynie', 'machine', 'Czworogłowe', true, 5),
  ex('leg-extension', 'Prostowanie nóg na maszynie', 'machine', 'Czworogłowe', false, 5, { cue: 'Zatrzymaj na 1 s w pełnym wyproście.' }),
  ex('leg-curl', 'Uginanie nóg leżąc/siedząc', 'machine', 'Dwugłowe uda', false, 5),
  ex('hip-thrust-machine', 'Hip thrust na maszynie', 'machine', 'Pośladki', true, 5),
  ex('abductor', 'Odwodzenie nóg na maszynie', 'machine', 'Pośladki', false, 5),
  ex('calf-machine', 'Wspięcia na palce na maszynie', 'machine', 'Łydki', false, 5),
  ex('chest-press', 'Wyciskanie na maszynie (chest press)', 'machine', 'Klatka', true, 5, { cue: 'Łopatki ściągnięte, uchwyty na wysokości środka klatki.' }),
  ex('incline-press-machine', 'Wyciskanie skośne na maszynie', 'machine', 'Klatka', true, 5),
  ex('pec-deck', 'Rozpiętki na maszynie (butterfly)', 'machine', 'Klatka', false, 5),
  ex('lat-pulldown', 'Ściąganie drążka do klatki', 'machine', 'Plecy', true, 5, { cue: 'Prowadź łokcie w dół, nie bujaj tułowiem.' }),
  ex('seated-row-machine', 'Wiosłowanie siedząc na maszynie', 'machine', 'Plecy', true, 5),
  ex('shoulder-press-machine', 'Wyciskanie nad głowę na maszynie', 'machine', 'Barki', true, 5),
  ex('reverse-fly', 'Odwrotne rozpiętki na maszynie', 'machine', 'Barki', false, 5),
  ex('preacher-machine', 'Uginanie ramion na maszynie (modlitewnik)', 'machine', 'Biceps', false, 5),
  ex('dip-machine', 'Prostowanie ramion na maszynie (dipy)', 'machine', 'Triceps', false, 5),
  ex('ab-crunch-machine', 'Spięcia brzucha na maszynie', 'machine', 'Core', false, 5),
  ex('assisted-pullup', 'Podciąganie z asystą na maszynie', 'machine', 'Plecy', true, 5),

  // Wyciągi
  ex('cable-row', 'Wiosłowanie linką siedząc', 'cable', 'Plecy', true, 5),
  ex('face-pull', 'Face pull na wyciągu', 'cable', 'Barki', false, 2.5, { cue: 'Ciągnij linkę do czoła, łokcie wysoko.' }),
  ex('cable-lateral', 'Wznosy bokiem na wyciągu', 'cable', 'Barki', false, 2.5),
  ex('triceps-pushdown', 'Prostowanie ramion na wyciągu', 'cable', 'Triceps', false, 2.5),
  ex('cable-curl', 'Uginanie ramion na wyciągu', 'cable', 'Biceps', false, 2.5),
  ex('cable-fly', 'Krzyżowanie linek', 'cable', 'Klatka', false, 2.5),
  ex('pallof', 'Pallof press', 'cable', 'Core', false, 2.5),

  // Sztanga
  ex('back-squat', 'Przysiad ze sztangą', 'barbell', 'Czworogłowe', true, 2.5),
  ex('deadlift', 'Martwy ciąg', 'barbell', 'Dwugłowe uda', true, 5),
  ex('rdl', 'Rumuński martwy ciąg', 'barbell', 'Dwugłowe uda', true, 2.5),
  ex('bench-press', 'Wyciskanie sztangi leżąc', 'barbell', 'Klatka', true, 2.5),
  ex('ohp', 'Wyciskanie żołnierskie', 'barbell', 'Barki', true, 2.5),
  ex('barbell-row', 'Wiosłowanie sztangą', 'barbell', 'Plecy', true, 2.5),
  ex('hip-thrust', 'Hip thrust ze sztangą', 'barbell', 'Pośladki', true, 5),

  // Hantle
  ex('db-press', 'Wyciskanie hantli leżąc', 'dumbbell', 'Klatka', true, 2),
  ex('db-incline', 'Wyciskanie hantli na skosie', 'dumbbell', 'Klatka', true, 2),
  ex('db-row', 'Wiosłowanie hantlem', 'dumbbell', 'Plecy', true, 2),
  ex('db-shoulder', 'Wyciskanie hantli nad głowę', 'dumbbell', 'Barki', true, 2),
  ex('db-lateral', 'Wznosy hantli bokiem', 'dumbbell', 'Barki', false, 1),
  ex('db-curl', 'Uginanie ramion z hantlami', 'dumbbell', 'Biceps', false, 1),
  ex('db-rdl', 'Rumuński martwy ciąg z hantlami', 'dumbbell', 'Dwugłowe uda', true, 2),
  ex('db-lunge', 'Wykroki z hantlami', 'dumbbell', 'Czworogłowe', true, 2),
  ex('goblet-squat-db', 'Goblet squat z hantlem', 'dumbbell', 'Czworogłowe', true, 2),

  // Kettlebell
  ex('kb-goblet', 'Goblet squat z kettlem', 'kettlebell', 'Czworogłowe', true, 4),
  ex('kb-swing', 'Swing kettlem', 'kettlebell', 'Pośladki', true, 4),
  ex('kb-row', 'Wiosłowanie kettlem', 'kettlebell', 'Plecy', true, 4),
  ex('kb-press', 'Wyciskanie kettla nad głowę', 'kettlebell', 'Barki', true, 4),
  ex('kb-deadlift', 'Martwy ciąg z kettlem', 'kettlebell', 'Dwugłowe uda', true, 4),

  // Masa ciała
  ex('pushup', 'Pompki', 'bodyweight', 'Klatka', true, 0),
  ex('pullup', 'Podciąganie na drążku', 'bodyweight', 'Plecy', true, 0),
  ex('inverted-row', 'Pompki australijskie', 'bodyweight', 'Plecy', true, 0),
  ex('dips', 'Pompki na poręczach', 'bodyweight', 'Triceps', true, 0),
  ex('bw-squat', 'Przysiad z masą ciała', 'bodyweight', 'Czworogłowe', true, 0),
  ex('reverse-lunge', 'Wykroki w tył', 'bodyweight', 'Czworogłowe', true, 0),
  ex('glute-bridge', 'Most biodrowy', 'bodyweight', 'Pośladki', true, 0),
  ex('plank', 'Plank', 'bodyweight', 'Core', false, 0, { timed: true }),
  ex('dead-bug', 'Dead bug', 'bodyweight', 'Core', false, 0),
  ex('l-sit', 'L-sit na poręczach', 'bodyweight', 'Core', false, 0, { timed: true }),
  ex('hanging-knee', 'Unoszenie kolan w zwisie', 'bodyweight', 'Core', false, 0),
  ex('burpee', 'Burpees', 'bodyweight', 'Kondycja', true, 0),
  ex('mountain-climber', 'Mountain climbers', 'bodyweight', 'Kondycja', false, 0, { timed: true }),
]

const BUILTIN_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

/** Własne ćwiczenia użytkownika – synchronizowane przez store przy każdym odczycie/zapisie */
let customMap: Record<string, Exercise> = {}
let customList: Exercise[] = []

export function setCustomExercises(list: Exercise[]) {
  if (list === customList) return
  customList = list
  customMap = Object.fromEntries(list.map((e) => [e.id, e]))
}

export function getExercise(id: string): Exercise | undefined {
  return customMap[id] ?? BUILTIN_MAP[id]
}

/** Własne ćwiczenia na początku, potem biblioteka */
export function allExercises(): Exercise[] {
  return [...customList, ...EXERCISES]
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Klatka',
  'Plecy',
  'Barki',
  'Biceps',
  'Triceps',
  'Czworogłowe',
  'Dwugłowe uda',
  'Pośladki',
  'Łydki',
  'Core',
  'Kondycja',
]

export const DEFAULT_INCREMENT: Record<Equipment, number> = {
  machine: 5,
  cable: 2.5,
  barbell: 2.5,
  dumbbell: 2,
  kettlebell: 4,
  bodyweight: 0,
}

/** Kolejne "sloty" mięśniowe dla danego typu treningu – generator wypełnia je ćwiczeniami */
export const FOCUS_SLOTS: Record<Focus, { muscle: MuscleGroup; compound?: boolean }[]> = {
  full: [
    { muscle: 'Czworogłowe', compound: true },
    { muscle: 'Klatka', compound: true },
    { muscle: 'Plecy', compound: true },
    { muscle: 'Dwugłowe uda' },
    { muscle: 'Barki' },
    { muscle: 'Plecy' },
    { muscle: 'Core' },
    { muscle: 'Biceps' },
  ],
  upper: [
    { muscle: 'Klatka', compound: true },
    { muscle: 'Plecy', compound: true },
    { muscle: 'Barki', compound: true },
    { muscle: 'Plecy' },
    { muscle: 'Klatka', compound: false },
    { muscle: 'Triceps' },
    { muscle: 'Biceps' },
    { muscle: 'Barki', compound: false },
  ],
  lower: [
    { muscle: 'Czworogłowe', compound: true },
    { muscle: 'Dwugłowe uda', compound: true },
    { muscle: 'Pośladki' },
    { muscle: 'Czworogłowe', compound: false },
    { muscle: 'Dwugłowe uda', compound: false },
    { muscle: 'Łydki' },
    { muscle: 'Core' },
  ],
  push: [
    { muscle: 'Klatka', compound: true },
    { muscle: 'Barki', compound: true },
    { muscle: 'Klatka' },
    { muscle: 'Barki', compound: false },
    { muscle: 'Triceps' },
    { muscle: 'Klatka', compound: false },
    { muscle: 'Triceps' },
  ],
  pull: [
    { muscle: 'Plecy', compound: true },
    { muscle: 'Plecy', compound: true },
    { muscle: 'Plecy' },
    { muscle: 'Barki', compound: false },
    { muscle: 'Biceps' },
    { muscle: 'Biceps' },
    { muscle: 'Core' },
  ],
  legs: [
    { muscle: 'Czworogłowe', compound: true },
    { muscle: 'Dwugłowe uda', compound: true },
    { muscle: 'Czworogłowe' },
    { muscle: 'Pośladki' },
    { muscle: 'Dwugłowe uda', compound: false },
    { muscle: 'Łydki' },
    { muscle: 'Core' },
  ],
  core: [
    { muscle: 'Core' },
    { muscle: 'Core' },
    { muscle: 'Core' },
    { muscle: 'Core' },
    { muscle: 'Kondycja' },
  ],
  custom: [],
}

export const FOCUS_LABELS: Record<Focus, string> = {
  full: 'Całe ciało',
  upper: 'Góra ciała',
  lower: 'Dół ciała',
  push: 'Push (wypychanie)',
  pull: 'Pull (przyciąganie)',
  legs: 'Nogi',
  core: 'Core i L-sit',
  custom: 'Własny trening',
}
