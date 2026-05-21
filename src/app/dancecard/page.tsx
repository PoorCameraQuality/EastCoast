import type { Metadata } from 'next'
import { DancecardLanding } from '@/components/dancecard/marketing/DancecardLanding'

export const metadata: Metadata = {
  title: 'Dancecard — plan your event weekend',
  alternates: { canonical: '/dancecard' },
}

export default function DancecardProductPage() {
  return <DancecardLanding />
}
