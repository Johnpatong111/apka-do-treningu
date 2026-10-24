'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Dumbbell, RotateCcw, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { EmptyState, Panel, Stat, Tag } from '@/components/kit'
import { ExerciseLogger } from './exercise-logger'
import { RestTimer } from './rest-timer'
import { completedSets, formatKg, workoutVolume } from '@/lib/calc'
import { formatLong } from '@/lib/dates'
import { exerciseHistory } from '@/lib/progression'
import { actions, useAppData, useHydrated } from '@/lib/store'
import type { Workout } from '@/lib/types'
import { cn } from '@/lib/utils'

export function WorkoutSession({ id }: { id: string }) {
  const router = useRouter()
  const hydrated = useHydrated()
  const data = useAppData()
  const workout = data.workouts.find((w) => w.id === id)
  const [timer, setTimer] = useState<{ endsAt: number; total: number } | null>(null)

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-card" aria-hidden />

  if (!workout) {
    return (
      <EmptyState
        icon={<Dumbbell className="size-5" aria-hidden />}
        title="Nie znaleziono treningu"
        description="Ten trening mógł zostać usunięty."
        action={<Link href="/trening" className={buttonVariants({ className: 'h-9 px-3' })}>Wróć do treningów</Link>}
      />
    )
  }

  // historia bez bieżącej sesji – do porównań i wykrywania rekordów
  const others = data.workouts.filter((w) => w.id !== workout.id)
  const save = (next: Workout) => actions.saveWorkout(next)

  const totalSets = workout.exercises.reduce((s, e) => s + e.log.length, 0)
  const doneSets = completedSets(workout)
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0

  const finish = () => {
    save({ ...workout, status: 'done', completedAt: new Date().toISOString() })
    router.push('/postepy')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/trening" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Treningi
      </Link>

      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone={workout.status === 'done' ? 'primary' : 'teal'}>{workout.status === 'done' ? 'Ukończony' : 'W trakcie'}</Tag>
          <span className="text-sm capitalize text-muted-foreground">{formatLong(workout.date)}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance md:text-3xl">{workout.title}</h1>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Serie" value={`${doneSets}/${totalSets}`} />
        <Stat label="Objętość" value={formatKg(workoutVolume(workout), 0)} unit="kg" />
        <Stat label="Postęp" value={pct} unit="%" tone="primary" />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary" aria-hidden>
        <div className="h-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {workout.exercises.map((we, i) => {
          const hist = exerciseHistory(others, we.exerciseId)
          return (
            <ExerciseLogger
              key={`${we.exerciseId}-${i}`}
              index={i}
              data={we}
              last={hist.at(-1)}
              bestE1rm={Math.max(0, ...hist.map((h) => h.bestE1rm))}
              onChange={(next) => save({ ...workout, exercises: workout.exercises.map((e, j) => (j === i ? next : e)) })}
              onSetDone={(rest) => setTimer({ endsAt: Date.now() + rest * 1000, total: rest })}
            />
          )
        })}
      </div>

      <Panel className="mt-4">
        <h2 className="font-semibold">Podsumowanie sesji</h2>
        <fieldset className="mt-3">
          <legend className="text-sm text-muted-foreground">Jak ciężko było? (RPE 1–10)</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={workout.rpe === n}
                onClick={() => save({ ...workout, rpe: n })}
                className={cn(
                  'size-9 rounded-lg border font-mono text-sm',
                  workout.rpe === n ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>
        <label htmlFor="w-notes" className="mt-4 block text-sm text-muted-foreground">Notatki</label>
        <textarea
          id="w-notes"
          rows={3}
          value={workout.notes ?? ''}
          onChange={(e) => save({ ...workout, notes: e.target.value })}
          placeholder="Samopoczucie, ból, ustawienia maszyn (np. siedzisko 4)…"
          className="mt-1.5 w-full rounded-lg border border-input bg-secondary p-3 text-sm outline-none focus-visible:border-primary"
        />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {workout.status === 'done' ? (
            <Button variant="outline" onClick={() => save({ ...workout, status: 'planned', completedAt: undefined })} className="h-11 px-4">
              <RotateCcw aria-hidden />
              Oznacz jako nieukończony
            </Button>
          ) : (
            <Button onClick={finish} disabled={doneSets === 0} className="h-11 flex-1 px-4 text-base">
              <CheckCircle2 aria-hidden />
              Zakończ trening
            </Button>
          )}
          <Button
            variant="destructive"
            className="h-11 px-4"
            onClick={() => {
              if (confirm('Usunąć ten trening?')) {
                actions.deleteWorkout(workout.id)
                router.push('/trening')
              }
            }}
          >
            <Trash2 aria-hidden />
            Usuń
          </Button>
        </div>
      </Panel>

      {timer && <RestTimer key={timer.endsAt} endsAt={timer.endsAt} total={timer.total} onClose={() => setTimer(null)} />}
    </div>
  )
}
