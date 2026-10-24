'use client'

import { useState } from 'react'
import { Plus, Scale, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TrendChart } from '@/components/charts'
import { EmptyState, Input, Panel, PanelHeader } from '@/components/kit'
import { formatKg } from '@/lib/calc'
import { formatShort, todayISO } from '@/lib/dates'
import { actions, useAppData } from '@/lib/store'

export function BodyWeight({ compact = false }: { compact?: boolean }) {
  const { weights, profile } = useAppData()
  const [kg, setKg] = useState('')
  const [date, setDate] = useState(todayISO())

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const v = Number(kg.replace(',', '.'))
    if (!v || v < 25 || v > 350) return
    actions.addWeight({ date, kg: Math.round(v * 10) / 10 })
    setKg('')
  }

  // 7-dniowa średnia krocząca wygładza wahania wody
  const data = weights.map((w, i) => {
    const window = weights.slice(Math.max(0, i - 6), i + 1)
    const avg = window.reduce((s, x) => s + x.kg, 0) / window.length
    return { label: formatShort(w.date), kg: w.kg, avg: Math.round(avg * 10) / 10, goal: profile.goalWeightKg }
  })
  const first = weights[0]
  const last = weights.at(-1)

  return (
    <Panel>
      <PanelHeader
        title="Masa ciała"
        description={last ? `Aktualnie ${formatKg(last.kg)} kg · cel ${formatKg(profile.goalWeightKg)} kg` : 'Waż się rano, na czczo, 3–7 razy w tygodniu'}
      />
      <form onSubmit={add} className="flex gap-2">
        <label htmlFor={`bw-kg-${compact}`} className="sr-only">Masa ciała w kg</label>
        <Input id={`bw-kg-${compact}`} inputMode="decimal" placeholder="np. 78,4" value={kg} onChange={(e) => setKg(e.target.value)} className="font-mono" />
        {!compact && (
          <>
            <label htmlFor="bw-date" className="sr-only">Data pomiaru</label>
            <Input id="bw-date" type="date" value={date} onChange={(e) => setDate(e.target.value || todayISO())} className="max-w-40" />
          </>
        )}
        <Button type="submit" className="h-10 px-4"><Plus aria-hidden />Dodaj</Button>
      </form>

      {weights.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={<Scale className="size-5" aria-hidden />} title="Brak pomiarów" description="Dodaj pierwszy pomiar, aby śledzić trend masy ciała względem celu." />
        </div>
      ) : (
        <>
          {first && last && weights.length > 1 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Zmiana od {formatShort(first.date)}:{' '}
              <span className="font-mono font-semibold text-foreground tabular-nums">
                {last.kg - first.kg > 0 ? '+' : ''}{formatKg(last.kg - first.kg)} kg
              </span>
              {' · '}do celu: <span className="font-mono text-foreground tabular-nums">{formatKg(Math.abs(last.kg - profile.goalWeightKg))} kg</span>
            </p>
          )}
          <div className="mt-3">
            <TrendChart
              height={compact ? 180 : 240}
              unit="kg"
              data={data}
              series={[
                { key: 'kg', label: 'Pomiar', color: 'var(--teal)' },
                { key: 'avg', label: 'Średnia 7 dni', color: 'var(--primary)' },
                { key: 'goal', label: 'Cel', color: 'var(--amber)', dashed: true },
              ]}
            />
          </div>
          {!compact && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {[...weights].reverse().slice(0, 10).map((w) => (
                <li key={w.date} className="flex items-center gap-1 rounded-full border border-border bg-secondary py-1 pr-1 pl-3 text-xs">
                  <span className="text-muted-foreground">{formatShort(w.date)}</span>
                  <span className="font-mono tabular-nums">{formatKg(w.kg)}</span>
                  <button type="button" onClick={() => actions.deleteWeight(w.date)} aria-label={`Usuń pomiar z ${formatShort(w.date)}`} className="rounded-full p-1 text-muted-foreground hover:text-destructive">
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Panel>
  )
}
