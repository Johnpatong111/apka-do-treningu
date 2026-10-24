'use client'

import { useEffect, useState } from 'react'
import { Timer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RestTimer({ endsAt, total, onClose }: { endsAt: number; total: number; onClose: () => void }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [endsAt])

  const left = Math.max(0, Math.ceil((endsAt - now) / 1000))
  const finished = left === 0

  useEffect(() => {
    if (finished && 'vibrate' in navigator) navigator.vibrate?.([200, 100, 200])
  }, [finished])

  const pct = Math.min(100, ((total - left) / total) * 100)
  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-primary/30 bg-popover shadow-2xl lg:bottom-6"
    >
      <div className="flex items-center gap-3 p-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
          <Timer className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{finished ? 'Przerwa zakończona' : 'Przerwa'}</p>
          <p className="font-mono text-2xl font-semibold tabular-nums">{finished ? 'Działaj!' : `${mm}:${ss}`}</p>
        </div>
        <Button variant="ghost" size="icon-lg" onClick={onClose} aria-label="Zamknij minutnik">
          <X aria-hidden />
        </Button>
      </div>
      <div className="h-1 bg-secondary">
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
