'use client'

import { useEffect } from 'react'

export default function VercelFeedbackBlocker() {
  const DEBUG = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Block Vercel feedback widget scripts
    const blockVercelFeedback = () => {
      // Remove any existing Vercel feedback elements
      const feedbackElements = document.querySelectorAll('[data-vercel-feedback], [class*="vercel"], [id*="vercel"]')
      feedbackElements.forEach(element => {
        if (DEBUG) console.log('🚫 VERCEL BLOCKER: Removing Vercel feedback element:', element)
        element.remove()
      })

      // Block script loading from vercel.live
      const originalCreateElement = document.createElement
      document.createElement = function(tagName: string) {
        const element = originalCreateElement.call(document, tagName)
        if (tagName.toLowerCase() === 'script') {
          const originalSetAttribute = element.setAttribute
          element.setAttribute = function(name: string, value: string) {
            if (name === 'src' && value.includes('vercel.live')) {
              if (DEBUG) console.log('🚫 VERCEL BLOCKER: Blocking script from vercel.live:', value)
              return element
            }
            return originalSetAttribute.call(this, name, value)
          }
        }
        return element
      }

      // Block fetch requests to vercel.live
      const originalFetch = window.fetch
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('vercel.live')) {
          if (DEBUG) console.log('🚫 VERCEL BLOCKER: Blocking fetch to vercel.live:', url)
          return Promise.reject(new Error('Vercel feedback widget blocked'))
        }
        return originalFetch.call(this, input, init)
      }

      // Block XMLHttpRequest to vercel.live
      const originalOpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
        const urlString = typeof url === 'string' ? url : url.toString()
        if (urlString.includes('vercel.live')) {
          if (DEBUG) console.log('🚫 VERCEL BLOCKER: Blocking XHR to vercel.live:', urlString)
          return
        }
        return originalOpen.call(this, method, url, async ?? true, username ?? null, password ?? null)
      }

      // Remove any error listeners that might be related to Vercel feedback
      window.addEventListener('error', (event) => {
        if (event.filename && event.filename.includes('vercel.live')) {
          if (DEBUG) console.log('🚫 VERCEL BLOCKER: Blocking error from vercel.live:', event.filename)
          event.preventDefault()
          event.stopPropagation()
        }
      }, true)

      // Block unhandled promise rejections from vercel.live
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && typeof event.reason === 'string' && event.reason.includes('vercel.live')) {
          if (DEBUG) console.log('🚫 VERCEL BLOCKER: Blocking unhandled rejection from vercel.live:', event.reason)
          event.preventDefault()
        }
      })
    }

    // Run immediately
    blockVercelFeedback()

    // Also run after a short delay to catch any late-loading scripts
    const timeoutId = setTimeout(blockVercelFeedback, 1000)

    // Clean up
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  return null
}
