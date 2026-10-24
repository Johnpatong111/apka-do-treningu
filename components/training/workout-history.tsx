'use client'

import Link from 'next/link'
import { History } from 'lucide-react'
import { EmptyState, Panel, PanelHeader } from '@/components/kit'
import { completedSets, formatKg, workoutVolume } from '@/lib/calc'
import { formatShort } from '@/lib/dates'
import { useAppData } from '@/lib/store'

export function WorkoutHistory() {
  const { workouts } = useAppData()
  const done = workouts
    .filter((w) => w.status === 'done')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  return (
    <Panel>
      <PanelHeader title="Ostatnie treningi" description="Kliknij, aby zobaczyć szczegóły lub poprawić serie" />
      {done.length === 0 ? (
        <EmptyState
          icon={<History className="size-5" aria-hidden />}
          title="Brak historii"
          description="Ukończone treningi pojawią się tutaj razem z objętością i liczbą serii."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {done.map((w) => (
            <li key={w.id}>
              <Link href={`/trening/${w.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-primary">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{w.title}</span>
                  <span className="block text-xs text-muted-foreground">{formatShort(w.date)} · {completedSets(w)} serii{w.rpe ? ` · RPE ${w.rpe}` : ''}</span>
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums">{formatKg(workoutVolume(w), 0)} kg</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
