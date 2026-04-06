'use client'

import { useState } from 'react'
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'
import Link from 'next/link'

interface EventSubmissionFormData {
  eventName: string
  eventDate: string
  eventLocation: string
  eventWebsite: string
  organizerName: string
  organizerEmail: string
  eventDescription: string
  eventCategory: string
  eventType: 'indoor' | 'outdoor'
  eventTags: string
  agreeToTerms: boolean
}

interface EventSubmissionFormProps {
  onSubmissionComplete?: () => void
}

export default function EventSubmissionForm({ onSubmissionComplete }: EventSubmissionFormProps) {
  const [formData, setFormData] = useState<EventSubmissionFormData>({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    eventWebsite: '',
    organizerName: '',
    organizerEmail: '',
    eventDescription: '',
    eventCategory: '',
    eventType: 'indoor',
    eventTags: '',
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
      const response = await fetch('/api/events/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        trackEvent('submit', 'event_submission', formData.eventCategory, 1)
        // Call the callback if provided
        if (onSubmissionComplete) {
          onSubmissionComplete()
        }
      } else {
        setError(result.error || 'Failed to submit event')
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
          <h3 className="text-2xl font-bold text-white mb-2">Event Submitted Successfully!</h3>
          <p className="text-gray-300">
            Thank you for submitting your event. Our team will review it and get back to you soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-elegant">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Submit Your Event</h2>
        <p className="text-gray-300">
          Have an event you'd like to share with the community? Submit it here for review and potential publication.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Event Information */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 border-b border-dark-600 pb-2">
            Event Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="event-submission-name" className="block text-white font-medium mb-2">Event Name *</label>
              <input
                id="event-submission-name"
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors min-h-touch"
                placeholder="Enter event name"
                required
              />
            </div>
            <div>
              <label htmlFor="event-submission-date" className="block text-white font-medium mb-2">Event Date *</label>
              <input
                id="event-submission-date"
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors min-h-touch"
                required
              />
            </div>
            <div>
              <label htmlFor="event-submission-location" className="block text-white font-medium mb-2">Event Location *</label>
              <input
                id="event-submission-location"
                type="text"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors min-h-touch"
                placeholder="City, State"
                required
              />
            </div>
            <div>
              <label htmlFor="event-submission-website" className="block text-white font-medium mb-2">Event Website</label>
              <input
                id="event-submission-website"
                type="url"
                name="eventWebsite"
                value={formData.eventWebsite}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors min-h-touch"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label htmlFor="event-submission-category" className="block text-white font-medium mb-2">Event Category *</label>
              <select
                id="event-submission-category"
                name="eventCategory"
                value={formData.eventCategory}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors min-h-touch"
                required
              >
                <option value="">Select Category</option>
                <option value="Conference">Conference</option>
                <option value="Indoor Event">Indoor Event</option>
                <option value="Outdoor Event">Outdoor Event</option>
              </select>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Event Type *</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="eventType"
                    value="indoor"
                    checked={formData.eventType === 'indoor'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 focus-visible:ring-ecke-focus"
                  />
                  <span className="text-white">Indoor</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="eventType"
                    value="outdoor"
                    checked={formData.eventType === 'outdoor'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 focus-visible:ring-ecke-focus"
                  />
                  <span className="text-white">Outdoor</span>
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="event-submission-tags" className="block text-white font-medium mb-2">Event Tags</label>
              <input
                id="event-submission-tags"
                type="text"
                name="eventTags"
                value={formData.eventTags}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors min-h-touch"
                placeholder="Comma-separated tags (e.g., beginners, rope, impact)"
              />
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="event-submission-description" className="block text-white font-medium mb-2">Event Description *</label>
            <textarea
              id="event-submission-description"
              name="eventDescription"
              value={formData.eventDescription}
              onChange={handleInputChange}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors h-32"
              placeholder="Describe your event in detail..."
              required
            />
          </div>
        </div>

        {/* Organizer Information */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 border-b border-dark-600 pb-2">
            Organizer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="event-submission-organizer-name" className="block text-white font-medium mb-2">Organizer Name *</label>
              <input
                id="event-submission-organizer-name"
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors min-h-touch"
                placeholder="Your name or organization name"
                required
              />
            </div>
            <div>
              <label htmlFor="event-submission-organizer-email" className="block text-white font-medium mb-2">Organizer Email *</label>
              <input
                id="event-submission-organizer-email"
                type="email"
                name="organizerEmail"
                value={formData.organizerEmail}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-ecke-focus focus-visible:ring-1 focus-visible:ring-ecke-focus transition-colors min-h-touch"
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
              id="event-submission-agree-terms"
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="w-5 h-5 min-h-touch min-w-touch text-primary-500 bg-dark-700 border-dark-600 rounded focus-visible:ring-ecke-focus mt-1"
              required
            />
            <label htmlFor="event-submission-agree-terms" className="text-gray-300 text-sm">
              I agree to the{' '}
              <Link href="/terms" className="text-primary-400 hover:text-primary-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-400 hover:text-primary-300 underline">
                Privacy Policy
              </Link>
              . I understand that my event submission will be reviewed before publication.
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
            {isSubmitting ? 'Submitting...' : 'Submit Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
