'use client'

import { Trophy } from 'lucide-react'
import { BarsChart } from '@/components/charts'
import { EmptyState, Panel, PanelHeader, Stat } from '@/components/kit'
import { ExerciseProgress } from './exercise-progress'
import { BodyWeight } from './body-weight'
import { doneWorkouts, muscleSets, weekStreak, weeklyVolume } from '@/lib/analytics'
import { formatKg, workoutVolume } from '@/lib/calc'
import { addDays, formatShort, todayISO } from '@/lib/dates'
import { getExercise } from '@/lib/exercises'
import { personalRecords } from '@/lib/progression'
import { useAppData } from '@/lib/store'

export function ProgressView() {
  const { workouts } = useAppData()
  const done = doneWorkouts(workouts)
  const from30 = addDays(todayISO(), -30)
  const last30 = done.filter((w) => w.date >= from30)
  const vol30 = last30.reduce((s, w) => s + workoutVolume(w), 0)
  const prs = personalRecords(workouts).sort((a, b) => b.date.localeCompare(a.date))
  const weekly = weeklyVolume(workouts)
  const muscles = muscleSets(workouts)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Treningi łącznie" value={done.length} />
        <Stat label="Ostatnie 30 dni" value={last30.length} unit="sesji" />
        <Stat label="Objętość 30 dni" value={formatKg(vol30 / 1000, 1)} unit="t" tone="primary" />
        <Stat label="Seria tygodni" value={weekStreak(workouts)} unit="tyg." hint="z min. 1 treningiem" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ExerciseProgress workouts={workouts} />
        <Panel>
          <PanelHeader title="Rekordy osobiste" description="Najwyższy szacowany 1RM w każdym ćwiczeniu" />
          {prs.length === 0 ? (
            <EmptyState icon={<Trophy className="size-5" aria-hidden />} title="Jeszcze bez rekordów" description="Każde ukończone ćwiczenie z ciężarem ustanowi tu Twój pierwszy rekord." />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {prs.slice(0, 10).map((pr) => {
                const ex = getExercise(pr.exerciseId)
                const usesWeight = (ex?.increment ?? 0) > 0
                return (
                  <li key={pr.exerciseId} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{ex?.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {formatShort(pr.date)} · {usesWeight ? `${formatKg(pr.weight)} kg × ${pr.reps}` : `${pr.reps} ${ex?.timed ? 's' : 'powt.'}`}
                      </span>
                    </span>
                    {usesWeight && <span className="shrink-0 font-mono text-sm font-semibold text-primary tabular-nums">{formatKg(pr.e1rm)} kg</span>}
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Objętość tygodniowa" description="Suma ciężar × powtórzenia, ostatnie 8 tygodni" />
          <BarsChart data={weekly} dataKey="volume" unit="kg" />
        </Panel>
        <Panel>
          <PanelHeader title="Serie na partie mięśniowe" description="Ostatnie 30 dni. Celuj w ok. 10–20 serii tygodniowo na partię." />
          {muscles.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Brak ukończonych serii w ostatnich 30 dniach.</p>
          ) : (
            <BarsChart data={muscles} dataKey="sets" color="var(--teal)" unit="serii" layout="vertical" height={Math.max(180, muscles.length * 32)} />
          )}
        </Panel>
      </div>

      <BodyWeight />
    </div>
  )
}
