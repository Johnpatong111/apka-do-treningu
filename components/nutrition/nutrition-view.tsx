'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, Field, Input, Panel, PanelHeader, Stat } from '@/components/kit'
import { BODY_GOAL_LABELS, nutritionTargets } from '@/lib/calc'
import { addDays, formatLong, todayISO } from '@/lib/dates'
import { actions, currentWeight, useAppData } from '@/lib/store'
import { cn } from '@/lib/utils'

const QUICK_FOODS = [
  { name: 'Pierś z kurczaka 150 g', kcal: 165, protein: 34, carbs: 0, fat: 3 },
  { name: 'Ryż biały 100 g (suchy)', kcal: 350, protein: 7, carbs: 78, fat: 1 },
  { name: 'Skyr naturalny 150 g', kcal: 95, protein: 17, carbs: 6, fat: 0 },
  { name: 'Jajka 3 szt.', kcal: 215, protein: 19, carbs: 1, fat: 15 },
  { name: 'Płatki owsiane 60 g', kcal: 225, protein: 8, carbs: 36, fat: 4 },
  { name: 'Odżywka białkowa 30 g', kcal: 120, protein: 24, carbs: 3, fat: 2 },
  { name: 'Banan', kcal: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Twaróg chudy 200 g', kcal: 180, protein: 36, carbs: 7, fat: 1 },
]

function MacroBar({ label, value, target, unit, color }: { label: string; value: number; target: number; unit: string; color: string }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">
          {Math.round(value)}<span className="text-muted-foreground"> / {target} {unit}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const emptyForm = { name: '', kcal: '', protein: '', carbs: '', fat: '' }

export function NutritionView() {
  const data = useAppData()
  const [date, setDate] = useState(todayISO())
  const [form, setForm] = useState(emptyForm)
  const weight = currentWeight(data) ?? data.profile.goalWeightKg
  const t = nutritionTargets(data.profile, weight)
  const meals = data.meals.filter((m) => m.date === date)
  const sum = meals.reduce((s, m) => ({ kcal: s.kcal + m.kcal, protein: s.protein + m.protein, carbs: s.carbs + m.carbs, fat: s.fat + m.fat }), { kcal: 0, protein: 0, carbs: 0, fat: 0 })

  const addMeal = (m: { name: string; kcal: number; protein: number; carbs: number; fat: number }) =>
    actions.addMeal({ id: crypto.randomUUID(), date, ...m })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const kcal = Number(form.kcal)
    if (!form.name.trim() || !kcal) return
    addMeal({ name: form.name.trim(), kcal, protein: Number(form.protein) || 0, carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0 })
    setForm(emptyForm)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Cel kaloryczny" value={t.kcal} unit="kcal" tone="primary" hint={BODY_GOAL_LABELS[data.profile.bodyGoal]} />
        <Stat label="Zapotrzebowanie (TDEE)" value={t.tdee} unit="kcal" hint={`BMR: ${t.bmr} kcal`} />
        <Stat label="Białko" value={t.protein} unit="g" hint={`${(t.protein / weight).toFixed(1)} g/kg masy`} />
        <Stat label="Tłuszcze / węgle" value={`${t.fat}/${t.carbs}`} unit="g" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel>
          <PanelHeader
            title="Bilans dnia"
            description={formatLong(date)}
            action={
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, -1))} aria-label="Poprzedni dzień"><ChevronLeft aria-hidden /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDate(todayISO())}>Dziś</Button>
                <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 1))} aria-label="Następny dzień"><ChevronRight aria-hidden /></Button>
              </div>
            }
          />
          <p className="font-mono text-4xl font-semibold tabular-nums">
            {sum.kcal}<span className="ml-1 text-base text-muted-foreground">/ {t.kcal} kcal</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sum.kcal <= t.kcal ? `Zostało ${t.kcal - sum.kcal} kcal` : `Ponad cel o ${sum.kcal - t.kcal} kcal`}
          </p>
          <div className="mt-5 flex flex-col gap-4">
            <MacroBar label="Kalorie" value={sum.kcal} target={t.kcal} unit="kcal" color="bg-primary" />
            <MacroBar label="Białko" value={sum.protein} target={t.protein} unit="g" color="bg-teal" />
            <MacroBar label="Węglowodany" value={sum.carbs} target={t.carbs} unit="g" color="bg-amber" />
            <MacroBar label="Tłuszcze" value={sum.fat} target={t.fat} unit="g" color="bg-destructive" />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Posiłki" description="Dodaj własny posiłek lub wybierz z szybkiej listy" />
          <form onSubmit={submit} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <div className="col-span-2 sm:col-span-6">
              <Field label="Nazwa" htmlFor="m-name">
                <Input id="m-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="np. Owsianka z owocami" />
              </Field>
            </div>
            {(['kcal', 'protein', 'carbs', 'fat'] as const).map((k) => (
              <div key={k} className="sm:col-span-1">
                <Field label={{ kcal: 'Kcal', protein: 'Białko g', carbs: 'Węgle g', fat: 'Tłuszcz g' }[k]} htmlFor={`m-${k}`}>
                  <Input id={`m-${k}`} type="number" inputMode="numeric" min={0} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="font-mono" />
                </Field>
              </div>
            ))}
            <div className="col-span-2 flex items-end">
              <Button type="submit" className="h-10 w-full px-4"><Plus aria-hidden />Dodaj</Button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_FOODS.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => addMeal(f)}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                + {f.name} <span className="font-mono">{f.kcal}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            {meals.length === 0 ? (
              <EmptyState icon={<Utensils className="size-5" aria-hidden />} title="Brak posiłków" description="Zapisuj posiłki, by trzymać kalorie i białko w ryzach." />
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {meals.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{m.name}</span>
                      <span className="block font-mono text-xs text-muted-foreground tabular-nums">B {m.protein} · W {m.carbs} · T {m.fat}</span>
                    </span>
                    <span className="font-mono text-sm tabular-nums">{m.kcal} kcal</span>
                    <Button variant="ghost" size="icon" onClick={() => actions.deleteMeal(m.id)} aria-label={`Usuń ${m.name}`}><Trash2 aria-hidden /></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}
