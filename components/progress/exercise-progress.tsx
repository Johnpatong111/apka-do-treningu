'use client'

import { useState } from 'react'
import { LineChart as LineIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { TrendChart } from '@/components/charts'
import { EmptyState, Panel, PanelHeader, Select, Tag } from '@/components/kit'
import { formatKg } from '@/lib/calc'
import { formatShort } from '@/lib/dates'
import { getExercise } from '@/lib/exercises'
import { exerciseHistory, trainedExerciseIds } from '@/lib/progression'
import type { Workout } from '@/lib/types'

export function ExerciseProgress({ workouts }: { workouts: Workout[] }) {
  const ids = trainedExerciseIds(workouts)
  const [chosen, setChosen] = useState<string | null>(null)
  const id = chosen && ids.includes(chosen) ? chosen : ids[0]

  if (!id) {
    return (
      <Panel>
        <PanelHeader title="Progres w ćwiczeniach" />
        <EmptyState
          icon={<LineIcon className="size-5" aria-hidden />}
          title="Brak danych do analizy"
          description="Zakończ pierwszy trening z zapisanymi seriami – tu zobaczysz wykres siły (e1RM) i ciężarów dla każdego ćwiczenia."
        />
      </Panel>
    )
  }

  const ex = getExercise(id)!
  const hist = exerciseHistory(workouts, id)
  const usesWeight = ex.increment > 0
  const chart = hist.map((h) => ({
    label: formatShort(h.date),
    e1rm: usesWeight ? Math.round(h.bestE1rm * 10) / 10 : null,
    top: usesWeight ? h.topWeight : h.topReps,
  }))
  const first = hist[0]
  const last = hist.at(-1)!
  const metric = (s: typeof last) => (usesWeight ? s.bestE1rm : s.topReps)
  const change = hist.length > 1 && metric(first) > 0 ? ((metric(last) - metric(first)) / metric(first)) * 100 : 0

  return (
    <Panel>
      <PanelHeader
        title="Progres w ćwiczeniach"
        description={usesWeight ? 'Szacowany 1RM (wzór Epleya) i najcięższa seria z każdej sesji' : 'Najlepsza seria z każdej sesji'}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="ex-pick" className="sr-only">Wybierz ćwiczenie</label>
        <Select id="ex-pick" value={id} onChange={(e) => setChosen(e.target.value)} className="sm:max-w-xs">
          {ids.map((x) => (
            <option key={x} value={x}>{getExercise(x)?.name ?? x}</option>
          ))}
        </Select>
        {hist.length > 1 && (
          <Tag tone={change >= 0 ? 'primary' : 'amber'}>
            {change >= 0 ? <TrendingUp className="size-3" aria-hidden /> : <TrendingDown className="size-3" aria-hidden />}
            {change >= 0 ? '+' : ''}{formatKg(change)}% od {formatShort(first.date)}
          </Tag>
        )}
      </div>

      <div className="mt-4">
        <TrendChart
          data={chart}
          unit={usesWeight ? 'kg' : ex.timed ? 's' : 'powt.'}
          series={
            usesWeight
              ? [
                  { key: 'e1rm', label: 'e1RM', color: 'var(--primary)' },
                  { key: 'top', label: 'Najcięższa seria', color: 'var(--teal)', dashed: true },
                ]
              : [{ key: 'top', label: 'Najlepsza seria', color: 'var(--primary)' }]
          }
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Historia sesji: {ex.name}</caption>
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 font-medium">Data</th>
              <th scope="col" className="py-2 font-medium">Serie</th>
              {usesWeight && <th scope="col" className="py-2 text-right font-medium">e1RM</th>}
              {usesWeight && <th scope="col" className="py-2 text-right font-medium">Objętość</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...hist].reverse().slice(0, 6).map((h) => (
              <tr key={h.workoutId}>
                <td className="py-2 whitespace-nowrap">{formatShort(h.date)}</td>
                <td className="py-2 font-mono text-xs tabular-nums">
                  {h.sets.map((s) => (usesWeight ? `${formatKg(s.weight)}×${s.reps}` : s.reps)).join(' · ')}
                </td>
                {usesWeight && <td className="py-2 text-right font-mono tabular-nums">{formatKg(h.bestE1rm)}</td>}
                {usesWeight && <td className="py-2 text-right font-mono tabular-nums">{formatKg(h.volume, 0)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
