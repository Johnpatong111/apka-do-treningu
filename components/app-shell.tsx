'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, LayoutDashboard, TrendingUp, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Panel główny', short: 'Start', icon: LayoutDashboard },
  { href: '/trening', label: 'Treningi', short: 'Trening', icon: Dumbbell },
  { href: '/postepy', label: 'Postępy', short: 'Postępy', icon: TrendingUp },
  { href: '/profil', label: 'Mój profil', short: 'Profil', icon: User },
]

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px] gap-6 px-4 pt-4 pb-24 md:px-6 md:pt-6 lg:pb-8">
      <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-56 shrink-0 flex-col lg:flex">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-mono text-base font-bold text-primary-foreground">FO</span>
          <span>
            <span className="block text-sm font-bold tracking-wide">FORMA ONLINE</span>
            <span className="block text-xs text-muted-foreground">Twoja forma. Twoje zasady.</span>
          </span>
        </Link>
        <nav aria-label="Główna nawigacja" className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                  active && 'bg-accent text-primary hover:text-primary',
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-primary/20 bg-accent p-4">
          <p className="text-sm font-semibold">Mały krok. Duża zmiana.</p>
          <p className="mt-1 text-xs text-muted-foreground">Konsekwencja wygrywa z perfekcją. Zrób dziś swoje minimum.</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mb-4 flex items-center gap-3 lg:hidden">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-foreground">FO</span>
          <span className="text-sm font-bold tracking-wide">FORMA ONLINE</span>
        </div>
        {children}
      </main>

      <nav
        aria-label="Nawigacja mobilna"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-card/95 px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
      >
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex min-w-0 flex-1 flex-col items-center gap-1 py-1 text-[11px] text-muted-foreground', active && 'text-primary')}
            >
              <item.icon className="size-5" aria-hidden />
              <span className="truncate">{item.short}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
