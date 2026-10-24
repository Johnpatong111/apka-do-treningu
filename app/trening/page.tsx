import type { Metadata } from 'next'
import { PageHeader } from '@/components/kit'
import { GeneratorPanel } from '@/components/training/generator-panel'
import { WeekPlanner } from '@/components/training/week-planner'
import { WorkoutHistory } from '@/components/training/workout-history'

export const metadata: Metadata = { title: 'Treningi' }

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Treningi"
        title="Twój trening. Twój plan."
        description="Wygeneruj sesję na maszynach lub wolnych ciężarach, zaplanuj ją w kalendarzu i zapisuj każdą serię."
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <GeneratorPanel />
        <div className="flex flex-col gap-4">
          <WeekPlanner />
          <WorkoutHistory />
        </div>
      </div>
    </>
  )
}
