import { Metadata } from 'next'
import { getDungeonBySlug, generateDungeonSEO } from '@/data/dungeons'
import Link from 'next/link'
import DungeonLogo from '@/components/DungeonLogo'
import { DungeonStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import Script from 'next/script'
import Image from 'next/image'

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
      url: `https://eastcoastkinkevents.com/dungeons/${params.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
    },
    alternates: {
      canonical: `https://eastcoastkinkevents.com/dungeons/${params.slug}`,
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
    return (
      <div className="min-h-screen bg-black">
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Dungeon Not Found</h1>
            <p className="text-subtle mb-8">The requested dungeon could not be found.</p>
            <Link href="/dungeons" className="btn-primary">
              Browse All Dungeons
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons', href: '/dungeons' },
    { label: dungeon.name, current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Breadcrumb JSON-LD */}
      <Script
        id={`breadcrumb-structured-data-dungeon-${dungeon.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {"@type": "ListItem", position: 1, name: 'Home', item: 'https://eastcoastkinkevents.com/'},
              {"@type": "ListItem", position: 2, name: 'Dungeons', item: 'https://eastcoastkinkevents.com/dungeons'},
              {"@type": "ListItem", position: 3, name: dungeon.name, item: `https://eastcoastkinkevents.com/dungeons/${dungeon.slug}`}
            ]
          })
        }}
      />
      <DungeonStructuredData dungeon={dungeon} />
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Dungeon Logo and Basic Info */}
          <div className="lg:col-span-1">
            <div className="card-elegant">
              {dungeon.logo && (
                <div className="mb-6">
                  <DungeonLogo 
                    src={dungeon.logo} 
                    alt={`${dungeon.name} logo`}
                    size="large"
                  />
                </div>
              )}
              
              <h1 className="text-3xl font-serif font-bold text-white mb-4">
                {dungeon.name}
              </h1>
              
              <div className="space-y-4 text-subtle">
                <div>
                  <span className="font-medium text-white">Location:</span>
                  <p>{dungeon.location.city}, {dungeon.location.state}</p>
                  <p className="text-sm">{dungeon.location.address}</p>
                </div>
                
                <div>
                  <span className="font-medium text-white">Category:</span>
                  <p>BDSM Dungeon</p>
                </div>
              </div>
              
              <div className="mt-6">
                <a 
                  href={dungeon.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </div>
          
          {/* Dungeon Details */}
          <div className="lg:col-span-2">
            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                About This Dungeon
              </h2>
              
              <div className="prose prose-invert max-w-none">
                {dungeon.description?.long ? (
                  <div>
                    {dungeon.description.long.split('\n\n').map((paragraph, index) => {
                      if (paragraph.startsWith('#')) {
                        const match = paragraph.match(/^#+/);
                        const level = match ? match[0].length : 1;
                        const title = paragraph.replace(/^#+\s*/, '');
                        const Tag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
                        return (
                          <Tag key={index} className="text-white font-serif font-semibold mb-4">
                            {title}
                          </Tag>
                        );
                      } else if (paragraph.trim()) {
                        return (
                          <p key={index} className="text-subtle mb-4 leading-relaxed">
                            {paragraph.trim()}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <p className="text-lg text-subtle mb-6">
                    {dungeon.excerpt}
                  </p>
                )}
              </div>
              
              {/* Contact Information */}
              <div className="mt-8">
                <h3 className="text-xl font-serif font-semibold text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-2 text-subtle">
                  {dungeon.contact.email && (
                    <p>
                      <span className="font-medium text-white">Email:</span> {dungeon.contact.email}
                    </p>
                  )}
                  {dungeon.contact.phone && (
                    <p>
                      <span className="font-medium text-white">Phone:</span> {dungeon.contact.phone}
                    </p>
                  )}
                  {dungeon.website && (
                    <p>
                      <span className="font-medium text-white">Website:</span>{' '}
                      <a 
                        href={dungeon.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300"
                      >
                        {dungeon.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dungeon Images */}
        {dungeon.images && dungeon.images.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-serif font-semibold text-white mb-6">
              Dungeon Photos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dungeon.images.map((image, index) => (
                <div key={index} className="card-elegant">
                  <Image 
                    src={image} 
                    alt={`${dungeon.name} photo ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Discord Community Section */}
        <div className="mt-16">
          <div className="card-elegant text-center">
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">
              Connect with the Community
            </h2>
            <p className="text-lg text-subtle mb-6 max-w-2xl mx-auto">
              Join our Discord community! Your hub for all discussions kinky. Connect with dungeon owners, 
              ask questions, share experiences, and stay updated on the latest events and announcements.
            </p>
            <Link 
              href="https://discord.gg/xcnGGyGsmT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 discord-glow"
            >
              Join Discord Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

