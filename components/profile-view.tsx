'use client'

import { useRef } from 'react'
import { Award, Download, Dumbbell, Flame, LockKeyhole, Medal, RotateCcw, Trophy, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Panel, PanelHeader, Select } from '@/components/kit'
import { formatLong, todayISO } from '@/lib/dates'
import { EQUIPMENT_LABELS } from '@/lib/exercises'
import { GOAL_LABELS, LEVEL_LABELS } from '@/lib/generator'
import { actions, useAppData, useHydrated } from '@/lib/store'
import type { AppData, Equipment, Goal, Level } from '@/lib/types'
import { cn } from '@/lib/utils'

const ACHIEVEMENT_ICONS = {
  award: Award,
  dumbbell: Dumbbell,
  flame: Flame,
  medal: Medal,
  trophy: Trophy,
} as const

export function ProfileView() {
  const hydrated = useHydrated()
  const data = useAppData()
  const p = data.profile
  const fileRef = useRef<HTMLInputElement>(null)

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-card" aria-hidden />

  const numField = (key: 'goalWeightKg' | 'daysPerWeek', label: string, min: number, max: number) => (
    <Field label={label} htmlFor={`p-${key}`}>
      <Input
        id={`p-${key}`}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        defaultValue={p[key]}
        onBlur={(e) => {
          const v = Number(e.target.value)
          if (v >= min && v <= max) actions.updateProfile({ [key]: v })
          else e.target.value = String(p[key])
        }}
        className="font-mono"
      />
    </Field>
  )

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forma-online-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData
      if (!parsed.profile || !Array.isArray(parsed.workouts)) throw new Error('format')
      if (confirm('Zastąpić obecne dane danymi z pliku?')) actions.importData(parsed)
    } catch {
      alert('Nieprawidłowy plik kopii zapasowej.')
    }
  }

  const toggleEq = (e: Equipment) =>
    actions.updateProfile({ equipment: p.equipment.includes(e) ? p.equipment.filter((x) => x !== e) : [...p.equipment, e] })

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Panel>
        <PanelHeader title="Dane i cele treningowe" description="Te ustawienia pomagają dopasować generator treningów do Twoich potrzeb." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Imię" htmlFor="p-name">
            <Input id="p-name" defaultValue={p.name} onBlur={(e) => actions.updateProfile({ name: e.target.value.trim() })} placeholder="Jak mamy się do Ciebie zwracać?" />
          </Field>
          {numField('goalWeightKg', 'Docelowa masa (kg)', 35, 250)}
          {numField('daysPerWeek', 'Treningi w tygodniu', 1, 7)}
          <Field label="Cel treningowy" htmlFor="p-tg">
            <Select id="p-tg" value={p.trainingGoal} onChange={(e) => actions.updateProfile({ trainingGoal: e.target.value as Goal })}>
              {Object.entries(GOAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Poziom" htmlFor="p-lvl">
            <Select id="p-lvl" value={p.level} onChange={(e) => actions.updateProfile({ level: e.target.value as Level })}>
              {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
        </div>
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-muted-foreground">Sprzęt na Twojej siłowni</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((e) => {
              const on = p.equipment.includes(e)
              return (
                <button
                  key={e}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleEq(e)}
                  className={cn('rounded-full border px-3 py-1.5 text-sm transition-colors', on ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-secondary text-muted-foreground hover:text-foreground')}
                >
                  {EQUIPMENT_LABELS[e]}
                </button>
              )
            })}
          </div>
        </fieldset>
      </Panel>

      <Panel>
        <PanelHeader title="Twoje dane" description="Dane są zapisywane w tej przeglądarce. Synchronizacja w chmurze (Supabase) zostanie dodana wkrótce." />
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Treningi', data.workouts.length],
            ['Pomiary', data.weights.length],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-secondary/60 p-3">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="outline" onClick={exportData} className="h-10 justify-start px-3"><Download aria-hidden />Pobierz kopię zapasową (JSON)</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="h-10 justify-start px-3"><Upload aria-hidden />Wczytaj kopię zapasową</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Usunąć wszystkie dane? Tej operacji nie można cofnąć.')) actions.reset()
            }}
            className="h-10 justify-start px-3"
          >
            <RotateCcw aria-hidden />
            Wyczyść wszystkie dane
          </Button>
        </div>
      </Panel>

      <Panel className="xl:col-span-2">
        <PanelHeader
          title="Twoje Osiągnięcia"
          description={`${data.achievements.filter((achievement) => achievement.isUnlocked).length} z ${data.achievements.length} odznak zdobytych`}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.achievements.map((achievement) => {
            const Icon = ACHIEVEMENT_ICONS[achievement.icon]
            return (
              <article
                key={achievement.id}
                className={cn(
                  'flex gap-3 rounded-xl border p-3 transition-colors',
                  achievement.isUnlocked
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-secondary/40 opacity-60 grayscale',
                )}
              >
                <div
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl',
                    achievement.isUnlocked
                      ? 'bg-primary/15 text-primary'
                      : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {achievement.isUnlocked ? (
                    <Icon className="size-5" aria-hidden />
                  ) : (
                    <LockKeyhole className="size-5" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <p className="mt-1 text-xs font-medium text-primary">
                      Zdobyto: {formatLong(achievement.unlockedAt)}
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
