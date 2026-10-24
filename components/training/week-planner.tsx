'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Dumbbell, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { EmptyState, Panel, PanelHeader, Tag } from '@/components/kit'
import { addDays, formatLong, formatShort, formatWeekday, fromISODate, todayISO, weekDays } from '@/lib/dates'
import { completedSets, formatKg, workoutVolume } from '@/lib/calc'
import { actions, useAppData } from '@/lib/store'
import { cn } from '@/lib/utils'

export function WeekPlanner({ compact = false }: { compact?: boolean }) {
  const { workouts } = useAppData()
  const today = todayISO()
  const [selected, setSelected] = useState(today)
  const days = weekDays(selected)
  const dayWorkouts = workouts.filter((w) => w.date === selected)

  return (
    <Panel>
      <PanelHeader
        title={compact ? 'Twój tydzień' : 'Kalendarz treningowy'}
        description={`${formatShort(days[0])} – ${formatShort(days[6])}`}
        action={
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSelected(addDays(selected, -7))} aria-label="Poprzedni tydzień"><ChevronLeft aria-hidden /></Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(today)}>Dziś</Button>
            <Button variant="ghost" size="icon" onClick={() => setSelected(addDays(selected, 7))} aria-label="Następny tydzień"><ChevronRight aria-hidden /></Button>
          </div>
        }
      />
      <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Dni tygodnia">
        {days.map((d) => {
          const ws = workouts.filter((w) => w.date === d)
          const done = ws.some((w) => w.status === 'done')
          const isSel = d === selected
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelected(d)}
              aria-pressed={isSel}
              aria-label={`${formatLong(d)}${ws.length ? `, ${ws.length} trening` : ''}`}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border py-2 text-xs transition-colors',
                isSel ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-secondary/60 text-muted-foreground hover:text-foreground',
                d === today && !isSel && 'border-primary/50',
              )}
            >
              <span className="capitalize">{formatWeekday(d)}</span>
              <span className={cn('font-mono text-base font-semibold', !isSel && 'text-foreground')}>{fromISODate(d).getDate()}</span>
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  ws.length === 0 && 'invisible',
                  done ? (isSel ? 'bg-primary-foreground' : 'bg-primary') : isSel ? 'bg-primary-foreground/50' : 'bg-teal',
                )}
              />
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <p className="text-sm font-medium capitalize text-muted-foreground">{formatLong(selected)}</p>
        {dayWorkouts.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="size-5" aria-hidden />}
            title="Dzień regeneracji"
            description="Brak zaplanowanego treningu. Odpoczynek też jest częścią planu – albo wygeneruj sesję."
            action={!compact ? undefined : <Link href="/trening" className={buttonVariants({ className: 'h-9 px-3' })}>Wygeneruj trening</Link>}
          />
        ) : (
          dayWorkouts.map((w) => {
            const sets = completedSets(w)
            const vol = workoutVolume(w)
            return (
              <div key={w.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3">
                {w.status === 'done' ? (
                  <CheckCircle2 className="size-5 shrink-0 text-primary" aria-label="Wykonany" />
                ) : (
                  <Circle className="size-5 shrink-0 text-muted-foreground" aria-label="Zaplanowany" />
                )}
                <Link href={`/trening/${w.id}`} className="min-w-0 flex-1 rounded-md focus-visible:outline-2 focus-visible:outline-primary">
                  <p className="truncate font-medium">{w.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.exercises.length} ćwiczeń · ~{w.estMinutes} min
                    {w.status === 'done' && ` · ${sets} serii · ${formatKg(vol, 0)} kg objętości`}
                  </p>
                </Link>
                <Tag tone={w.status === 'done' ? 'primary' : 'teal'}>{w.status === 'done' ? 'Zrobione' : 'Plan'}</Tag>
                {!compact && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Usuń trening ${w.title}`}
                    onClick={() => {
                      if (confirm('Usunąć ten trening wraz z zapisanymi seriami?')) actions.deleteWorkout(w.id)
                    }}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>
    </Panel>
  )
}
