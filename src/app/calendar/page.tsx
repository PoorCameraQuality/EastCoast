import { Metadata } from 'next'

import { CalendarStructuredData } from '@/components/StructuredData'

import Breadcrumb from '@/components/Breadcrumb'

import CalendarPageClient from '@/components/calendar/CalendarPageClient'

import { getUnifiedEvents } from '@/lib/unifiedEvents'

import { buildIndexFromUnified } from '@/lib/publicEventIndex'

import { BASE_URL } from '@/lib/seo'



export const revalidate = 1800



export async function generateMetadata(): Promise<Metadata> {

  const year = new Date().getFullYear()

  const title = `Kink Event Calendar ${year} · Plan by Month`

  const description = `Plan around kink events, conventions, classes, and vendor markets by month. Filter by region, export to Google, Apple, or iCal. East Coast focus, national listings.`

  return {

    title,

    description: description.slice(0, 160),

    robots: {

      index: true,

      follow: true,

      googleBot: {

        index: true,

        follow: true,

      },

    },

    alternates: {

      canonical: `${BASE_URL}/calendar`,

    },

    openGraph: {

      title,

      description: description.slice(0, 200),

      type: 'website',

      url: `${BASE_URL}/calendar`,

      images: [

        {

          url: `${BASE_URL}/og-image.png`,

          width: 1200,

          height: 630,

          alt: 'East Coast Kink Events Calendar',

        },

      ],

    },

    twitter: {

      card: 'summary_large_image',

      title,

      description: description.slice(0, 200),

      images: [`${BASE_URL}/og-image.png`],

    },

  }

}



export default async function CalendarPage() {

  const unified = await getUnifiedEvents()

  const indexItems = buildIndexFromUnified(unified)

  const breadcrumbItems = [

    { label: 'Home', href: '/' },

    { label: 'Calendar', href: '/calendar', current: true },

  ]



  return (

    <main className="min-h-screen bg-black cal-page-shell">

      <CalendarStructuredData />

      <div className="container-custom section-padding">

        <Breadcrumb items={breadcrumbItems} />

        <CalendarPageClient indexItems={indexItems} />

      </div>

    </main>

  )

}

