import type { Metadata } from 'next'
import { PageHeader } from '@/components/kit'
import { Calculators } from '@/components/calculators'

export const metadata: Metadata = { title: 'Kalkulatory' }

export default function CalculatorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kalkulatory"
        title="Policz, zanim podniesiesz."
        description="1RM, ciężar na maszynie dla zadanych powtórzeń, talerze na sztangę i BMI."
      />
      <Calculators />
    </>
  )
}
