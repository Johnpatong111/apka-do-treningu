import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Panel({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('rounded-2xl border border-border bg-card p-4 md:p-5', className)} {...props} />
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-balance">{title}</h2>
        {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function Stat({
  label,
  value,
  unit,
  hint,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  unit?: string
  hint?: ReactNode
  tone?: 'default' | 'primary'
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums md:text-3xl', tone === 'primary' && 'text-primary')}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Tag({ children, tone = 'default', className }: { children: ReactNode; tone?: 'default' | 'primary' | 'teal' | 'amber'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tone === 'default' && 'border-border bg-secondary text-muted-foreground',
        tone === 'primary' && 'border-primary/30 bg-primary/10 text-primary',
        tone === 'teal' && 'border-teal/30 bg-teal/10 text-teal',
        tone === 'amber' && 'border-amber/30 bg-amber/10 text-amber',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

const controlClass =
  'h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(controlClass, className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(controlClass, 'appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239aa9a1' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props} />
}

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  unit,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  unit?: string
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100))
  const btn =
    'flex size-9 shrink-0 items-center justify-center rounded-md text-lg leading-none text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40'
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center rounded-lg border border-input bg-secondary">
        <button type="button" className={btn} onClick={() => onChange(clamp(value - step))} disabled={value <= min} aria-label={`${label}: mniej`}>
          {'−'}
        </button>
        <input
          type="number"
          inputMode="decimal"
          aria-label={label}
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
          className="h-9 w-full min-w-0 bg-transparent text-center font-mono text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && <span className="pr-1 text-xs text-muted-foreground">{unit}</span>}
        <button type="button" className={btn} onClick={() => onChange(clamp(value + step))} disabled={value >= max} aria-label={`${label}: więcej`}>
          +
        </button>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">{icon}</div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      </div>
      {action}
    </div>
  )
}
