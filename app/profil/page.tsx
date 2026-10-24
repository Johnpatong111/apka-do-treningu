import type { Metadata } from 'next'
import { PageHeader } from '@/components/kit'
import { ProfileView } from '@/components/profile-view'

export const metadata: Metadata = { title: 'Mój profil' }

export default function ProfilePage() {
  return (
    <>
      <PageHeader eyebrow="Profil" title="Mój profil" description="Ustaw cele treningowe i dostępny sprzęt, aby dopasować generator do swoich potrzeb." />
      <ProfileView />
    </>
  )
}
