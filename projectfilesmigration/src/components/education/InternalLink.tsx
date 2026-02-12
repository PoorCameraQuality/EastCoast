'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface InternalLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  title?: string
}

export default function InternalLink({ href, children, className = '', title }: InternalLinkProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [articleTitle, setArticleTitle] = useState<string>('')

  useEffect(() => {
    // Check if it's an internal education link
    if (href.startsWith('/education/')) {
      checkArticleExists(href)
    } else {
      setIsValid(true) // Assume external links are valid
    }
  }, [href])

  const checkArticleExists = async (linkPath: string) => {
    try {
      const client = supabase
      if (!client) {
        setIsValid(true) // If no client, assume valid
        return
      }

      const slug = linkPath.replace('/education/', '')
      
      const { data: article, error } = await client
        .from('articles')
        .select('title, status')
        .eq('slug', slug)
        .single()

      if (error || !article || article.status !== 'published') {
        setIsValid(false)
      } else {
        setIsValid(true)
        setArticleTitle(article.title)
      }
    } catch (error) {
      console.error('Error checking article:', error)
      setIsValid(true) // Assume valid on error
    }
  }

  // If link is invalid, render as plain text
  if (isValid === false) {
    return (
      <span className={`text-gray-400 cursor-not-allowed ${className}`} title="Article not found">
        {children}
      </span>
    )
  }

  // If it's an internal education link and we have a title, show it in the tooltip
  const linkTitle = title || (href.startsWith('/education/') && articleTitle ? articleTitle : undefined)

  return (
    <Link 
      href={href}
      className={`text-primary-400 hover:text-primary-300 underline hover:no-underline transition-colors ${className}`}
      title={linkTitle}
    >
      {children}
    </Link>
  )
}
