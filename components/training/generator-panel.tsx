'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, Minus, Play, Plus, RefreshCw, Shuffle, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Panel, PanelHeader, Select, Tag } from '@/components/kit'
import { EQUIPMENT_LABELS, FOCUS_LABELS, getExercise } from '@/lib/exercises'
import { GOAL_LABELS, LEVEL_LABELS, alternativesFor, buildExercise, estimateMinutes, generateWorkout } from '@/lib/generator'
import { initLog } from '@/lib/progression'
import { actions, useAppData } from '@/lib/store'
import { todayISO } from '@/lib/dates'
import { formatKg } from '@/lib/calc'
import type { Equipment, Focus, Goal, Level, Workout } from '@/lib/types'
import { cn } from '@/lib/utils'

const ALL_EQUIPMENT = Object.keys(EQUIPMENT_LABELS) as Equipment[]

export function GeneratorPanel({ defaultDate }: { defaultDate?: string }) {
  const router = useRouter()
  const data = useAppData()
  const { profile } = data
  const [focus, setFocus] = useState<Focus>('full')
  const [goal, setGoal] = useState<Goal>(profile.trainingGoal)
  const [level, setLevel] = useState<Level>(profile.level)
  const [minutes, setMinutes] = useState(50)
  const [date, setDate] = useState(defaultDate ?? todayISO())
  const [equipment, setEquipment] = useState<Equipment[]>(profile.equipment)
  const [preferMachines, setPreferMachines] = useState(true)
  const [draft, setDraft] = useState<Workout | null>(null)

  const toggleEquipment = (e: Equipment) =>
    setEquipment((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]))

  const generate = () => {
    if (equipment.length === 0) return
    setDraft(generateWorkout({ focus, goal, level, minutes, date, equipment, preferMachines }, data.workouts))
  }

  const updateDraft = (fn: (w: Workout) => Workout) =>
    setDraft((w) => {
      if (!w) return w
      const next = fn(w)
      return { ...next, estMinutes: estimateMinutes(next) }
    })

  const swap = (index: number) =>
    updateDraft((w) => {
      const current = w.exercises[index]
      const alts = alternativesFor(current.exerciseId, equipment, w.exercises.map((e) => e.exerciseId))
      if (alts.length === 0) return w
      const pick = alts[Math.floor(Math.random() * alts.length)]
      const exercises = [...w.exercises]
      exercises[index] = buildExercise(pick.id, w.goal, level, data.workouts)
      return { ...w, exercises }
    })

  const changeSets = (index: number, delta: number) =>
    updateDraft((w) => {
      const exercises = [...w.exercises]
      const ex = exercises[index]
      const sets = Math.min(8, Math.max(1, ex.sets + delta))
      exercises[index] = { ...ex, sets, log: initLog({ sets, suggestedWeight: ex.suggestedWeight }) }
      return { ...w, exercises }
    })

  const remove = (index: number) => updateDraft((w) => ({ ...w, exercises: w.exercises.filter((_, i) => i !== index) }))

  const save = (start: boolean) => {
    if (!draft || draft.exercises.length === 0) return
    const w = { ...draft, date }
    actions.saveWorkout(w)
    setDraft(null)
    if (start) router.push(`/trening/${w.id}`)
  }

  return (
    <Panel>
      <PanelHeader
        title="Generator treningów"
        description="Plan dopasowany do celu, czasu i sprzętu. Ciężary podpowiadane na podstawie Twojej historii."
        action={<Tag tone="primary"><Sparkles className="size-3" aria-hidden />Progresja</Tag>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Rodzaj treningu" htmlFor="g-focus">
          <Select id="g-focus" value={focus} onChange={(e) => setFocus(e.target.value as Focus)}>
            {Object.entries(FOCUS_LABELS).filter(([k]) => k !== 'custom').map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cel" htmlFor="g-goal">
          <Select id="g-goal" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
            {Object.entries(GOAL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="Poziom" htmlFor="g-level">
          <Select id="g-level" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
            {Object.entries(LEVEL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="Data treningu" htmlFor="g-date">
          <Input id="g-date" type="date" value={date} onChange={(e) => setDate(e.target.value || todayISO())} />
        </Field>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label htmlFor="g-time" className="text-sm font-medium text-muted-foreground">Czas na trening</label>
          <span className="font-mono text-sm font-semibold text-primary tabular-nums">{minutes} min</span>
        </div>
        <input
          id="g-time"
          type="range"
          min={20}
          max={90}
          step={5}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--primary)]"
        />
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-muted-foreground">Dostępny sprzęt</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_EQUIPMENT.map((e) => {
            const on = equipment.includes(e)
            return (
              <button
                key={e}
                type="button"
                aria-pressed={on}
                onClick={() => toggleEquipment(e)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-colors',
                  on ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
                )}
              >
                {EQUIPMENT_LABELS[e]}
              </button>
            )
          })}
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={preferMachines} onChange={(e) => setPreferMachines(e.target.checked)} className="size-4 accent-[var(--primary)]" />
          Preferuj maszyny i wyciągi
        </label>
      </fieldset>

      <Button onClick={generate} disabled={equipment.length === 0} className="mt-5 h-10 w-full px-4 sm:w-auto">
        <Sparkles aria-hidden />
        {draft ? 'Generuj od nowa' : 'Generuj trening'}
      </Button>

      {draft && (
        <div className="mt-6 border-t border-border pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">{draft.title}</h3>
              <p className="text-sm text-muted-foreground">
                {draft.exercises.length} ćwiczeń · ok. {draft.estMinutes} min · rozgrzewka 5 min + schłodzenie 3 min
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => save(false)} className="h-10 flex-1 px-3 sm:flex-none">
                <CalendarPlus aria-hidden />
                Do planu
              </Button>
              <Button onClick={() => save(true)} className="h-10 flex-1 px-3 sm:flex-none">
                <Play aria-hidden />
                Zacznij teraz
              </Button>
            </div>
          </div>

          <ol className="mt-4 flex flex-col gap-2">
            {draft.exercises.map((we, i) => {
              const ex = getExercise(we.exerciseId)
              if (!ex) return null
              return (
                <li key={`${we.exerciseId}-${i}`} className="rounded-xl border border-border bg-secondary/50 p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent font-mono text-xs font-semibold text-primary">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{ex.name}</p>
                        <Tag>{ex.muscle}</Tag>
                        <Tag tone={ex.equipment === 'machine' || ex.equipment === 'cable' ? 'teal' : 'default'}>{EQUIPMENT_LABELS[ex.equipment]}</Tag>
                      </div>
                      <p className="mt-1 text-sm">
                        <span className="font-mono tabular-nums">{we.sets} × {we.repMin}–{we.repMax}</span>
                        <span className="text-muted-foreground">{ex.timed ? ' s' : ' powt.'} · przerwa {Math.round(we.restSec / 15) * 15} s</span>
                        {we.suggestedWeight !== null && (
                          <span className="ml-2 font-mono font-semibold text-primary tabular-nums">{formatKg(we.suggestedWeight)} kg</span>
                        )}
                      </p>
                      {we.suggestionNote && <p className="mt-1 text-xs text-muted-foreground">{we.suggestionNote}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1 pl-10">
                    <Button variant="ghost" size="sm" onClick={() => changeSets(i, -1)} aria-label="Usuń serię"><Minus aria-hidden /></Button>
                    <span className="text-xs text-muted-foreground">serie</span>
                    <Button variant="ghost" size="sm" onClick={() => changeSets(i, 1)} aria-label="Dodaj serię"><Plus aria-hidden /></Button>
                    <Button variant="ghost" size="sm" onClick={() => swap(i)}><Shuffle aria-hidden />Zamień</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(i)} className="text-destructive hover:text-destructive"><Trash2 aria-hidden />Usuń</Button>
                  </div>
                </li>
              )
            })}
          </ol>
          <Button variant="ghost" onClick={generate} className="mt-3 h-9 px-3 text-muted-foreground">
            <RefreshCw aria-hidden />
            Wylosuj inny zestaw
          </Button>
        </div>
      )}
    </Panel>
  )
}
