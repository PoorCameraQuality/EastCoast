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
      
      <EnhancedDungeonLayout dungeon={dungeon} breadcrumbItems={breadcrumbItems} />
    </div>
  )
}

// Enhanced layout for dungeons with dynamic color schemes
function EnhancedDungeonLayout({ dungeon, breadcrumbItems }: { dungeon: any, breadcrumbItems: any[] }) {
  // Color scheme for dungeons - using blue spectrum colors
  const colors = {
    primary: 'from-primary-500 to-blue-500',
    secondary: 'from-primary-600 to-blue-600',
    tertiary: 'from-primary-700 to-blue-700',
    accent: 'from-primary-400 via-blue-400 to-primary-600',
    hover: 'hover:text-primary-300',
    buttonHover: 'hover:from-primary-700 hover:via-blue-700 hover:to-primary-800'
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Compact Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-dark-900 to-black">
        {/* Subtle background elements with blue spectrum */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-20 right-8 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-4 left-1/4 w-20 h-20 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container-custom py-8 relative z-10">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="max-w-6xl mx-auto">
            {/* Header Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
              {/* Logo and Title */}
              <div className="flex items-center gap-6">
                {dungeon.logo && (
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.accent} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                    <DungeonLogo 
                      src={dungeon.logo} 
                      alt={`${dungeon.name} logo`}
                      size="medium"
                      className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                    {dungeon.name.split(' ').map((word: string, index: number) => (
                      <span key={index} className={`inline-block ${colors.hover} transition-colors duration-300`}>
                        {word}{' '}
                      </span>
                    ))}
                  </h1>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 text-white text-sm">
                      📍 {dungeon.location.city}, {dungeon.location.state}
                    </span>
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 text-white text-sm">
                      {dungeon.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <a 
                href={dungeon.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`group inline-block bg-gradient-to-r ${colors.accent} text-white font-bold py-3 px-6 rounded-full ${colors.buttonHover} transition-all duration-300 shadow-xl hover:shadow-primary-500/25 hover:scale-105 whitespace-nowrap`}
              >
                <span className="flex items-center gap-2">
                  Visit Website
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Content Section */}
      <section className="py-8 bg-gradient-to-b from-dark-900 to-black">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - About & Features */}
              <div className="space-y-6">
                {/* About Section */}
                <div className="bg-gradient-to-br from-dark-900 to-black border border-dark-700 rounded-2xl p-6">
                  <h2 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.primary} rounded-lg flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    About This Dungeon
                  </h2>
                  <div className="text-gray-300 space-y-3">
                    <p className="text-lg leading-relaxed">{dungeon.excerpt}</p>
                    {dungeon.description?.long && (
                      <div className="text-gray-300 whitespace-pre-line text-sm">
                        {dungeon.description.long}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Dungeon Details & Quick Info */}
              <div className="space-y-6">
                {/* Dungeon Details Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-dark-900 to-black border border-dark-700 rounded-2xl p-4 transition-all duration-300 hover:border-opacity-50 hover:border-current">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.primary} rounded-lg flex items-center justify-center mb-3`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Dungeon Type</h3>
                    <p className="text-gray-300 text-sm">{dungeon.category}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-dark-900 to-black border border-dark-700 rounded-2xl p-4 transition-all duration-300 hover:border-opacity-50 hover:border-current">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.secondary} rounded-lg flex items-center justify-center mb-3`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Location</h3>
                    <p className="text-gray-300 text-sm">{dungeon.location.city}, {dungeon.location.state}</p>
                    {dungeon.location.address && (
                      <p className="text-gray-400 text-xs">{dungeon.location.address}</p>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-br from-dark-900 to-black border border-dark-700 rounded-2xl p-4 transition-all duration-300 hover:border-opacity-50 hover:border-current">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.tertiary} rounded-lg flex items-center justify-center mb-3`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Website</h3>
                    <a 
                      href={dungeon.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="transition-colors underline text-sm break-all hover:text-primary-300"
                    >
                      {dungeon.website}
                    </a>
                  </div>
                </div>

                {/* Discord Community */}
                <div className="bg-gradient-to-br from-dark-900 to-black border border-dark-700 rounded-2xl p-6">
                  <h2 className="text-xl font-serif font-bold text-white mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    Connect with Community
                  </h2>
                  <p className="text-gray-300 text-sm mb-4">
                    Join our Discord community! Connect with dungeon owners, ask questions, and stay updated.
                  </p>
                  <Link 
                    href="https://discord.gg/xcnGGyGsmT" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group inline-block bg-gradient-to-r from-primary-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:from-primary-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-primary-500/25 hover:scale-105 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      Join Discord
                      <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

