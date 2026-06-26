'use client'

import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    requestAnimationFrame(() => {
      setIsVisible(window.pageYOffset > 300)
    })
  }

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-[65] min-h-touch min-w-touch rounded-full border border-violet-500/40 bg-violet-600/90 p-3 text-white shadow-lg transition-all duration-300 hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:bottom-8 sm:right-8 sm:hover:scale-110"
          aria-label="Back to top"
        >
          <svg
            aria-hidden="true"
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  )
}
