import type { Metadata } from 'next'
import { PageHeader } from '@/components/kit'
import { ProgressView } from '@/components/progress/progress-view'

export const metadata: Metadata = { title: 'Postępy' }

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        eyebrow="Postępy"
        title="Liczby nie kłamią."
        description="Siła, objętość, rekordy i masa ciała w jednym miejscu. Analizuj, co działa, i podnoś poprzeczkę."
      />
      <ProgressView />
    </>
  )
}
