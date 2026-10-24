import type { Metadata } from 'next'
import { PageHeader } from '@/components/kit'
import { NutritionView } from '@/components/nutrition/nutrition-view'

export const metadata: Metadata = { title: 'Odżywianie' }

export default function NutritionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Odżywianie"
        title="Paliwo do formy."
        description="Cele kaloryczne i makro liczone z Twojego profilu i aktualnej masy ciała (Mifflin–St Jeor)."
      />
      <NutritionView />
    </>
  )
}
