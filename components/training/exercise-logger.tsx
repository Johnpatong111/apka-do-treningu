'use client'

import { Check, Minus, Plus, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/kit'
import { EQUIPMENT_LABELS, getExercise } from '@/lib/exercises'
import { e1rm, formatKg } from '@/lib/calc'
import { formatShort } from '@/lib/dates'
import type { ExerciseSession } from '@/lib/progression'
import type { SetLog, WorkoutExercise } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  index: number
  data: WorkoutExercise
  last?: ExerciseSession
  bestE1rm: number
  onChange: (next: WorkoutExercise) => void
  onSetDone: (restSec: number) => void
}

export function ExerciseLogger({ index, data, last, bestE1rm, onChange, onSetDone }: Props) {
  const ex = getExercise(data.exerciseId)
  if (!ex) return null
  const unit = ex.timed ? 's' : 'powt.'
  const usesWeight = ex.increment > 0

  const setLog = (i: number, patch: Partial<SetLog>) => {
    const log = data.log.map((s, j) => (j === i ? { ...s, ...patch } : s))
    onChange({ ...data, log })
  }

  const toggleDone = (i: number) => {
    const s = data.log[i]
    const nowDone = !s.done
    const reps = nowDone && s.reps === 0 ? data.repMax : s.reps
    const log = data.log.map((x, j) => {
      if (j === i) return { ...x, done: nowDone, reps }
      // przenieś ciężar na kolejne nieukończone serie
      if (nowDone && j > i && !x.done && x.weight === 0) return { ...x, weight: s.weight }
      return x
    })
    onChange({ ...data, log })
    if (nowDone) onSetDone(data.restSec)
  }

  const addSet = () => {
    const prev = data.log.at(-1)
    onChange({ ...data, sets: data.sets + 1, log: [...data.log, { weight: prev?.weight ?? data.suggestedWeight ?? 0, reps: 0, done: false }] })
  }
  const removeSet = () => {
    if (data.log.length <= 1) return
    onChange({ ...data, sets: data.sets - 1, log: data.log.slice(0, -1) })
  }

  const doneCount = data.log.filter((s) => s.done).length
  const sessionBest = Math.max(0, ...data.log.filter((s) => s.done).map((s) => e1rm(s.weight, s.reps)))
  const isPr = usesWeight && sessionBest > 0 && sessionBest > bestE1rm + 0.01

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-start gap-3">
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold', doneCount === data.log.length ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary')}>
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{ex.name}</h3>
            {isPr && <Tag tone="amber"><Trophy className="size-3" aria-hidden />Nowy rekord</Tag>}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {ex.muscle} · {EQUIPMENT_LABELS[ex.equipment]} · cel <span className="font-mono text-foreground tabular-nums">{data.sets}×{data.repMin}–{data.repMax}</span> {unit}
          </p>
        </div>
      </header>

      {(data.suggestionNote || last) && (
        <div className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm">
          {data.suggestionNote && <p className="text-pretty">{data.suggestionNote}</p>}
          {last && (
            <p className="mt-1 text-xs text-muted-foreground">
              Ostatnio ({formatShort(last.date)}):{' '}
              <span className="font-mono tabular-nums">
                {last.sets.map((s) => (usesWeight ? `${formatKg(s.weight)}×${s.reps}` : `${s.reps}`)).join(' · ')}
              </span>
            </p>
          )}
          {ex.cue && <p className="mt-1 text-xs text-teal">Wskazówka: {ex.cue}</p>}
        </div>
      )}

      <div className="mt-3">
        <div className={cn('grid items-center gap-2 px-1 pb-1 text-xs text-muted-foreground', usesWeight ? 'grid-cols-[2rem_1fr_1fr_2.75rem]' : 'grid-cols-[2rem_1fr_2.75rem]')}>
          <span>Seria</span>
          {usesWeight && <span>Ciężar (kg)</span>}
          <span>{ex.timed ? 'Czas (s)' : 'Powtórzenia'}</span>
          <span className="sr-only">Wykonana</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {data.log.map((s, i) => (
            <li
              key={i}
              className={cn(
                'grid items-center gap-2 rounded-xl p-1 transition-colors',
                usesWeight ? 'grid-cols-[2rem_1fr_1fr_2.75rem]' : 'grid-cols-[2rem_1fr_2.75rem]',
                s.done && 'bg-primary/10',
              )}
            >
              <span className="text-center font-mono text-sm text-muted-foreground">{i + 1}</span>
              {usesWeight && (
                <input
                  type="number"
                  inputMode="decimal"
                  step={ex.increment}
                  min={0}
                  aria-label={`Ciężar, seria ${i + 1}`}
                  value={s.weight || ''}
                  placeholder={data.suggestedWeight ? String(data.suggestedWeight) : '0'}
                  onChange={(e) => setLog(i, { weight: Number(e.target.value) || 0 })}
                  className="h-11 w-full min-w-0 rounded-lg border border-input bg-secondary px-3 text-center font-mono text-base tabular-nums outline-none focus-visible:border-primary"
                />
              )}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                aria-label={`${ex.timed ? 'Czas' : 'Powtórzenia'}, seria ${i + 1}`}
                value={s.reps || ''}
                placeholder={String(data.repMax)}
                onChange={(e) => setLog(i, { reps: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
                className="h-11 w-full min-w-0 rounded-lg border border-input bg-secondary px-3 text-center font-mono text-base tabular-nums outline-none focus-visible:border-primary"
              />
              <button
                type="button"
                onClick={() => toggleDone(i)}
                aria-pressed={s.done}
                aria-label={s.done ? `Cofnij serię ${i + 1}` : `Zalicz serię ${i + 1}`}
                className={cn(
                  'flex size-11 items-center justify-center rounded-lg border transition-colors',
                  s.done ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                <Check className="size-5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={addSet}><Plus aria-hidden />Seria</Button>
          <Button variant="ghost" size="sm" onClick={removeSet} disabled={data.log.length <= 1}><Minus aria-hidden />Seria</Button>
          {usesWeight && sessionBest > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              e1RM <span className="font-mono text-foreground tabular-nums">{formatKg(sessionBest)} kg</span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
