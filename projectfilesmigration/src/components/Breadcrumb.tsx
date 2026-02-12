import Link from 'next/link'
import { BASE_URL } from '@/lib/seo'

interface BreadcrumbItem {
  label: string
  href: string
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
      "item": `${BASE_URL}${item.href}`,
    }))
  }

  return (
    <>
      <script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-300 flex gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
          <span key={index} className="flex items-center gap-2">
            {item.current ? (
              <span aria-current="page" className="text-yellow-400">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {item.label}
              </Link>
            )}
            {!isLast ? <span className="text-gray-500">/</span> : null}
          </span>
        )})}
      </nav>
    </>
  )
}
