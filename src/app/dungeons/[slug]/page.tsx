import { Metadata } from 'next'
import { getDungeonBySlug, generateDungeonSEO } from '@/data/dungeons'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DungeonStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DungeonImage from '@/components/dungeons/DungeonImage'
import { BASE_URL } from '@/lib/seo'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dungeon = getDungeonBySlug(params.slug)
  
  if (!dungeon) {
    return {
      title: 'Dungeon Not Found',
      description: 'The requested dungeon could not be found.'
    }
  }

  const seo = generateDungeonSEO(dungeon)
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
      type: 'website',
      url: `${BASE_URL}/dungeons/${params.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
    },
    alternates: {
      canonical: `${BASE_URL}/dungeons/${params.slug}`,
    },
  }
}

// Generate static params for all dungeons
export async function generateStaticParams() {
  const { dungeons } = await import('@/data/dungeons')
  return dungeons.map((dungeon) => ({
    slug: dungeon.slug,
  }))
}

export default function DungeonPage({ params }: { params: { slug: string } }) {
  const dungeon = getDungeonBySlug(params.slug)

  if (!dungeon) {
    notFound()
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons', href: '/dungeons' },
    { label: dungeon.name, href: `/dungeons/${dungeon.slug}`, current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <DungeonStructuredData dungeon={dungeon} />

      <section className="section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-4">
            <Link href="/dungeons" className="btn-outline inline-flex items-center px-4 py-2 text-sm">
              Back to Dungeons
            </Link>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row gap-6 items-start">
            <DungeonImage
              src={dungeon.logo}
              alt={`${dungeon.name} logo`}
              size={96}
              className="flex-shrink-0"
            />
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-white">
                {dungeon.name}
              </h1>
              <p className="text-gray-400 mt-2">
                {dungeon.location.city}, {dungeon.location.state}
              </p>
              {dungeon.category ? (
                <span className="mt-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                  {dungeon.category}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            <article className="card-elegant p-6">
              <h2 className="text-2xl font-serif font-semibold text-white">About this space</h2>
              <p className="text-gray-300 mt-4 whitespace-pre-line leading-relaxed">
                {dungeon.description?.long || dungeon.excerpt || 'Details coming soon.'}
              </p>
            </article>

            <aside className="card-elegant p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Location</h3>
                <p className="text-sm text-gray-300">
                  {dungeon.location.city}, {dungeon.location.state}
                </p>
                {dungeon.location.address ? (
                  <p className="text-xs text-gray-500 mt-1">{dungeon.location.address}</p>
                ) : null}
              </div>

              {dungeon.website ? (
                <a
                  href={dungeon.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center justify-center px-4 py-2 text-sm w-full"
                  aria-label={`Visit ${dungeon.name} website (opens in a new tab)`}
                >
                  Visit Website
                </a>
              ) : null}

              <Link
                href="/contact"
                className="btn-outline inline-flex items-center justify-center px-4 py-2 text-sm w-full"
              >
                Contact Us
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <div className="container-custom pb-12">
        <RelatedContent currentDungeon={dungeon} />
      </div>
    </div>
  )
}
