import Link from 'next/link'
import Script from 'next/script'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href ? { "item": `https://www.eastcoastkinkevents.com${item.href}` } : {})
    }))
  }

  return (
    <>
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-300 flex gap-2">
        {items.map((item, index) => (
          <span key={index}>
            {item.current ? (
              <span aria-current="page" className="text-yellow-400">{item.label}</span>
            ) : (
              <a href={item.href} className="hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {item.label}
              </a>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
