export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function startOfWeek(iso: string): string {
  const d = fromISODate(iso)
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return toISODate(d)
}

export function weekDays(iso: string): string[] {
  const start = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

const shortFmt = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' })
const longFmt = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
const dayFmt = new Intl.DateTimeFormat('pl-PL', { weekday: 'short' })

export function formatShort(iso: string): string {
  return shortFmt.format(fromISODate(iso))
}

export function formatLong(iso: string): string {
  return longFmt.format(fromISODate(iso))
}

export function formatWeekday(iso: string): string {
  return dayFmt.format(fromISODate(iso)).replace('.', '')
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / 86400000)
}
