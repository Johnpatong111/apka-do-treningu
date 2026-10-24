'use client'

import Link from 'next/link'
import { ArrowRight, Dumbbell, Play, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader, Panel, Stat, Tag } from '@/components/kit'
import { WeekPlanner } from '@/components/training/week-planner'
import { BodyWeight } from '@/components/progress/body-weight'
import { daysSinceLast, sessionsThisWeek, weekStreak } from '@/lib/analytics'
import { formatKg, nutritionTargets } from '@/lib/calc'
import { formatLong, todayISO } from '@/lib/dates'
import { getExercise } from '@/lib/exercises'
import { personalRecords } from '@/lib/progression'
import { currentWeight, useAppData, useHydrated } from '@/lib/store'

export function Dashboard() {
  const hydrated = useHydrated()
  const data = useAppData()
  const today = todayISO()
  const todays = data.workouts.filter((w) => w.date === today)
  const planned = todays.find((w) => w.status === 'planned')
  const doneToday = todays.find((w) => w.status === 'done')
  const weight = currentWeight(data)
  const targets = nutritionTargets(data.profile, weight ?? data.profile.goalWeightKg)
  const kcalToday = data.meals.filter((m) => m.date === today).reduce((s, m) => s + m.kcal, 0)
  const week = sessionsThisWeek(data.workouts)
  const since = daysSinceLast(data.workouts)
  const lastPr = personalRecords(data.workouts).sort((a, b) => b.date.localeCompare(a.date))[0]

  const name = data.profile.name.trim()
  const greeting = hydrated && name ? `Cześć, ${name}.` : 'Cześć.'

  return (
    <>
      <PageHeader
        eyebrow={formatLong(today)}
        title={greeting}
        description={
          since === null
            ? 'Zacznij od wygenerowania pierwszego treningu. Aplikacja zapamięta ciężary i będzie podpowiadać progres.'
            : since === 0
              ? 'Dzisiejszy trening zaliczony. Teraz regeneracja i białko.'
              : `Ostatni trening: ${since === 1 ? 'wczoraj' : `${since} dni temu`}. Konsekwencja buduje formę.`
        }
      />

      <Panel className="mb-4 flex flex-col gap-4 border-primary/25 bg-accent md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="size-6" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">Dzisiaj</p>
            <p className="mt-1 text-lg font-semibold text-balance">
              {planned ? planned.title : doneToday ? `Zrobione: ${doneToday.title}` : 'Brak zaplanowanego treningu'}
            </p>
            <p className="text-sm text-muted-foreground">
              {planned
                ? `${planned.exercises.length} ćwiczeń · ok. ${planned.estMinutes} min`
                : doneToday
                  ? 'Świetna robota. Zajrzyj w postępy.'
                  : 'Wygeneruj sesję dopasowaną do czasu i sprzętu.'}
            </p>
          </div>
        </div>
        {planned ? (
          <Link href={`/trening/${planned.id}`} className={buttonVariants({ className: 'h-11 px-5 text-base' })}>
            <Play aria-hidden />
            Zacznij trening
          </Link>
        ) : doneToday ? (
          <Link href="/postepy" className={buttonVariants({ variant: 'outline', className: 'h-11 px-5' })}>
            Zobacz postępy
            <ArrowRight aria-hidden />
          </Link>
        ) : (
          <Link href="/trening" className={buttonVariants({ className: 'h-11 px-5 text-base' })}>
            <Sparkles aria-hidden />
            Generuj trening
          </Link>
        )}
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Treningi w tym tygodniu" value={`${week}/${data.profile.daysPerWeek}`} hint={`Seria: ${weekStreak(data.workouts)} tyg.`} tone={week >= data.profile.daysPerWeek ? 'primary' : 'default'} />
        <Stat
          label="Masa ciała"
          value={weight !== null ? formatKg(weight) : '–'}
          unit={weight !== null ? 'kg' : undefined}
          hint={`Cel: ${formatKg(data.profile.goalWeightKg)} kg`}
        />
        <Stat label="Kalorie dziś" value={kcalToday} unit={`/ ${targets.kcal}`} hint={`Białko: cel ${targets.protein} g`} />
        <Stat
          label="Ostatni rekord"
          value={lastPr ? formatKg(lastPr.e1rm) : '–'}
          unit={lastPr ? 'kg' : undefined}
          hint={lastPr ? <Tag className="max-w-full truncate">{getExercise(lastPr.exerciseId)?.name}</Tag> : 'Szacowany 1RM'}
          tone="primary"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <WeekPlanner compact />
        <BodyWeight compact />
      </div>
    </>
  )
}
