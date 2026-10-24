import type { Metadata } from 'next'
import { WorkoutSession } from '@/components/training/workout-session'

export const metadata: Metadata = { title: 'Sesja treningowa' }

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <WorkoutSession id={id} />
}
