'use client'

import { useState, useEffect } from 'react'

interface TableOfContentsProps {
  content: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from content and create TOC
  useEffect(() => {
    const headings = content.match(/^#{1,3}\s+(.+)$/gm)
    if (headings) {
      const items: TocItem[] = headings.map((heading, index) => {
        const level = heading.match(/^#+/)?.[0].length || 1
        const text = heading.replace(/^#+\s+/, '')
        const id = `heading-${index}`
        return { id, text, level }
      })
      setTocItems(items)
    }
  }, [content])

  // Update active heading based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3')
      let current = ''

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          current = heading.id
        }
      })

      setActiveId(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (tocItems.length === 0) return null

  return (
    <div className="card-elegant mb-8">
      <h3 className="text-lg font-serif font-semibold text-white mb-4">Table of Contents</h3>
      <nav className="space-y-2">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`block w-full text-left text-sm transition-colors duration-200 hover:text-primary-400 ${
              activeId === item.id ? 'text-primary-400 font-medium' : 'text-subtle'
            } ${item.level === 1 ? 'font-medium' : item.level === 2 ? 'ml-4' : 'ml-8'}`}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  )
}
