'use client'

import { useState } from 'react'
import { Field, Input, Panel, PanelHeader, Select } from '@/components/kit'
import { bmi, e1rm, formatKg, platesPerSide, roundTo, weightForReps } from '@/lib/calc'
import { currentWeight, useAppData } from '@/lib/store'

const num = (s: string) => Number(s.replace(',', '.')) || 0

function OneRepMax() {
  const [w, setW] = useState('80')
  const [r, setR] = useState('8')
  const max = e1rm(num(w), Math.round(num(r)))
  const percents = [100, 95, 90, 85, 80, 75, 70, 65, 60]

  return (
    <Panel>
      <PanelHeader title="Kalkulator 1RM" description="Szacowany ciężar maksymalny na 1 powtórzenie (Epley) i ciężary robocze" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ciężar (kg)" htmlFor="rm-w"><Input id="rm-w" inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} className="font-mono" /></Field>
        <Field label="Powtórzenia" htmlFor="rm-r"><Input id="rm-r" inputMode="numeric" value={r} onChange={(e) => setR(e.target.value)} className="font-mono" /></Field>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Szacowany 1RM</p>
      <p className="font-mono text-4xl font-semibold text-primary tabular-nums">{formatKg(max)} kg</p>
      {max > 0 && (
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Ciężary procentowe</caption>
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th scope="col" className="py-1.5 font-medium">% 1RM</th>
              <th scope="col" className="py-1.5 text-right font-medium">Ciężar</th>
              <th scope="col" className="py-1.5 text-right font-medium">~ powt.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono tabular-nums">
            {percents.map((p) => {
              const load = (max * p) / 100
              const reps = p === 100 ? 1 : Math.max(1, Math.round(30 * (max / load - 1)))
              return (
                <tr key={p}>
                  <td className="py-1.5">{p}%</td>
                  <td className="py-1.5 text-right">{formatKg(roundTo(load, 2.5))} kg</td>
                  <td className="py-1.5 text-right text-muted-foreground">{reps}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Panel>
  )
}

function RepTarget() {
  const [max, setMax] = useState('100')
  const [reps, setReps] = useState('10')
  const [step, setStep] = useState('5')
  const load = weightForReps(num(max), Math.round(num(reps)))
  return (
    <Panel>
      <PanelHeader title="Ciężar na maszynie" description="Ile ustawić na stosie, by zrobić zadaną liczbę powtórzeń" />
      <div className="grid grid-cols-3 gap-3">
        <Field label="1RM (kg)" htmlFor="rt-m"><Input id="rt-m" inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} className="font-mono" /></Field>
        <Field label="Powtórzenia" htmlFor="rt-r"><Input id="rt-r" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} className="font-mono" /></Field>
        <Field label="Krok stosu" htmlFor="rt-s">
          <Select id="rt-s" value={step} onChange={(e) => setStep(e.target.value)}>
            {['2.5', '5', '7', '10'].map((s) => <option key={s} value={s}>{s.replace('.', ',')} kg</option>)}
          </Select>
        </Field>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Ustaw na maszynie</p>
      <p className="font-mono text-4xl font-semibold text-primary tabular-nums">{formatKg(roundTo(load, num(step)))} kg</p>
      <p className="mt-1 text-xs text-muted-foreground">Dokładnie: {formatKg(load)} kg. Dla zapasu 2 powt. odejmij ok. 5%.</p>
    </Panel>
  )
}

function Plates() {
  const [total, setTotal] = useState('100')
  const [bar, setBar] = useState('20')
  const { plates, remainder } = platesPerSide(num(total), num(bar))
  return (
    <Panel>
      <PanelHeader title="Talerze na sztangę" description="Co założyć na każdą stronę" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ciężar całkowity (kg)" htmlFor="pl-t"><Input id="pl-t" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} className="font-mono" /></Field>
        <Field label="Gryf" htmlFor="pl-b">
          <Select id="pl-b" value={bar} onChange={(e) => setBar(e.target.value)}>
            <option value="20">Olimpijski 20 kg</option>
            <option value="15">Damski 15 kg</option>
            <option value="10">Łamany 10 kg</option>
          </Select>
        </Field>
      </div>
      <div className="mt-5 flex min-h-20 items-center gap-1 overflow-x-auto rounded-xl bg-secondary/60 p-3" aria-label="Talerze na jedną stronę">
        <span className="h-3 w-10 shrink-0 rounded-l bg-muted-foreground/60" aria-hidden />
        {plates.length === 0 && <span className="text-sm text-muted-foreground">Sam gryf</span>}
        {plates.map((p, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center justify-center rounded bg-primary font-mono text-[10px] font-bold text-primary-foreground"
            style={{ width: 22, height: 24 + p * 1.8 }}
          >
            {formatKg(p, 2)}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm">
        Na stronę: <span className="font-mono tabular-nums">{plates.length ? plates.map((p) => formatKg(p, 2)).join(' + ') : '—'}</span>
      </p>
      {remainder > 0 && <p className="mt-1 text-xs text-amber">Nie da się złożyć dokładnie – brakuje {formatKg(remainder, 2)} kg.</p>}
    </Panel>
  )
}

function Bmi() {
  const data = useAppData()
  const [w, setW] = useState(String(currentWeight(data) ?? data.profile.goalWeightKg))
  const [h, setH] = useState(String(data.profile.heightCm))
  const v = num(h) > 0 ? bmi(num(w), num(h)) : 0
  const label = v === 0 ? '' : v < 18.5 ? 'Niedowaga' : v < 25 ? 'Prawidłowa masa' : v < 30 ? 'Nadwaga' : 'Otyłość'
  return (
    <Panel>
      <PanelHeader title="BMI" description="Orientacyjny wskaźnik – nie uwzględnia masy mięśniowej" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Masa (kg)" htmlFor="bmi-w"><Input id="bmi-w" inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} className="font-mono" /></Field>
        <Field label="Wzrost (cm)" htmlFor="bmi-h"><Input id="bmi-h" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} className="font-mono" /></Field>
      </div>
      <p className="mt-4 font-mono text-4xl font-semibold text-primary tabular-nums">{v ? formatKg(v) : '–'}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Panel>
  )
}

export function Calculators() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <OneRepMax />
      <div className="flex flex-col gap-4">
        <RepTarget />
        <Plates />
        <Bmi />
      </div>
    </div>
  )
}
