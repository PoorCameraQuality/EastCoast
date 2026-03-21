'use client'

import { useState } from 'react'
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'
import Link from 'next/link'

interface DungeonSubmissionFormData {
  dungeonName: string
  dungeonLocation: string
  dungeonWebsite: string
  ownerName: string
  ownerEmail: string
  dungeonDescription: string
  dungeonCategory: string
  dungeonTags: string
  agreeToTerms: boolean
}

export default function DungeonSubmissionForm() {
  const [formData, setFormData] = useState<DungeonSubmissionFormData>({
    dungeonName: '',
    dungeonLocation: '',
    dungeonWebsite: '',
    ownerName: '',
    ownerEmail: '',
    dungeonDescription: '',
    dungeonCategory: '',
    dungeonTags: '',
    agreeToTerms: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')

  const { trackEvent } = useGoogleAnalytics()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/dungeons/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        trackEvent('submit', 'dungeon_submission', formData.dungeonCategory, 1)
      } else {
        setError(result.error || 'Failed to submit dungeon')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="card-elegant text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Dungeon Submitted Successfully!</h3>
          <p className="text-gray-300">
            Thank you for submitting your dungeon. Our team will review it and get back to you soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-elegant">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Submit Your Dungeon</h2>
        <p className="text-gray-300">
          Have a dungeon or kink space you'd like to share with the community? Submit it here for review and potential publication.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dungeon Information */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 border-b border-dark-600 pb-2">
            Dungeon Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Dungeon Name *</label>
              <input
                type="text"
                name="dungeonName"
                value={formData.dungeonName}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Enter dungeon name"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Dungeon Location *</label>
              <input
                type="text"
                name="dungeonLocation"
                value={formData.dungeonLocation}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="City, State"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Dungeon Website</label>
              <input
                type="url"
                name="dungeonWebsite"
                value={formData.dungeonWebsite}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Dungeon Category *</label>
              <select
                name="dungeonCategory"
                value={formData.dungeonCategory}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                required
              >
                <option value="">Select Category</option>
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="Membership">Membership</option>
                <option value="Rental">Rental</option>
                <option value="Educational">Educational</option>
                <option value="Social">Social</option>
              </select>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Dungeon Tags</label>
              <input
                type="text"
                name="dungeonTags"
                value={formData.dungeonTags}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Comma-separated tags (e.g., rope, impact, suspension)"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-white font-medium mb-2">Dungeon Description *</label>
            <textarea
              name="dungeonDescription"
              value={formData.dungeonDescription}
              onChange={handleInputChange}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors h-32"
              placeholder="Describe your dungeon in detail..."
              required
            />
          </div>
        </div>

        {/* Owner Information */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 border-b border-dark-600 pb-2">
            Owner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Owner Name *</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Your name or organization name"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Owner Email *</label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Terms and Submit */}
        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 mt-1"
              required
            />
            <label className="text-gray-300 text-sm">
              I agree to the{' '}
              <Link href="/terms" className="text-primary-400 hover:text-primary-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-400 hover:text-primary-300 underline">
                Privacy Policy
              </Link>
              . I understand that my dungeon submission will be reviewed before publication.
            </label>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.agreeToTerms}
            className="w-full min-h-touch btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Dungeon'}
          </button>
        </div>
      </form>
    </div>
  )
}
