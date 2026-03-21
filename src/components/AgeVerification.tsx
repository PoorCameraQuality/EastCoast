'use client'

import { useState, useEffect } from 'react'

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    // Check if this is a search engine bot
    const isBot = () => {
      if (typeof navigator === 'undefined') return true // SSR - assume bot
      
      const userAgent = navigator.userAgent.toLowerCase()
      const botPatterns = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
        'yandexbot', 'facebookexternalhit', 'twitterbot', 'rogerbot',
        'linkedinbot', 'embedly', 'quora link preview', 'showyoubot',
        'outbrain', 'pinterest/0.', 'developers.google.com/+/web/snippet',
        'www.google.com/webmasters/tools/richsnippets', 'slackbot', 'vkshare',
        'w3c_validator', 'redditbot', 'applebot', 'whatsapp', 'flipboard',
        'tumblr', 'bitlybot', 'skypeuripreview', 'nuzzel', 'discordbot',
        'google page speed', 'qwantify', 'pinterestbot', 'bitrix link preview',
        'xing-contenttabreceiver', 'chrome-lighthouse', 'telegrambot'
      ]
      
      return botPatterns.some(pattern => userAgent.includes(pattern))
    }

    // Skip age verification for search engine bots
    if (isBot()) {
      setIsVerified(true)
      return
    }

    // Check if user has already verified their age
    const verified = localStorage.getItem('ageVerified')
    if (verified === 'true') {
      setIsVerified(true)
    } else {
      setShowModal(true)
    }
  }, [])

  const handleVerify = () => {
    localStorage.setItem('ageVerified', 'true')
    setIsVerified(true)
    setShowModal(false)
  }

  const handleRedirect = () => {
    window.location.href = 'https://www.google.com'
  }

  if (isVerified) {
    return null
  }

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[var(--z-ecke-modal)]">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Age Verification Required
              </h2>
              
              <p className="text-gray-300 mb-6">
                This website contains adult content and is intended for individuals 18 years of age or older.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="age-verify"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="mr-3 w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label htmlFor="age-verify" className="text-white">
                    I confirm that I am at least 18 years old
                  </label>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleVerify}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                    disabled={!isChecked}
                  >
                    Enter Site
                  </button>
                  
                  <button
                    onClick={handleRedirect}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                  >
                    Exit
                  </button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mt-4">
                By entering this site, you acknowledge that you are of legal age and agree to our terms of service.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
