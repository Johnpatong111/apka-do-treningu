import type { Metadata } from 'next'
import { PageHeader } from '@/components/kit'
import { ProfileView } from '@/components/profile-view'

export const metadata: Metadata = { title: 'Mój profil' }

export default function ProfilePage() {
  return (
    <>
      <PageHeader eyebrow="Profil" title="Mój profil" description="Ustaw dane, cele i sprzęt – generator i kalkulator diety dopasują się automatycznie." />
      <ProfileView />
    </>
  )
}
