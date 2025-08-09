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
  organizerPhone: string
  eventDescription: string
  eventCategory: string
  eventTags: string
  agreeToTerms: boolean
}

export default function EventSubmissionForm() {
  const [formData, setFormData] = useState<EventSubmissionFormData>({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    eventWebsite: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    eventDescription: '',
    eventCategory: '',
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
        <button
          onClick={() => {
            setSubmitSuccess(false)
            setFormData({
              eventName: '',
              eventDate: '',
              eventLocation: '',
              eventWebsite: '',
              organizerName: '',
              organizerEmail: '',
              organizerPhone: '',
              eventDescription: '',
              eventCategory: '',
              eventTags: '',
              agreeToTerms: false
            })
          }}
          className="btn-primary"
        >
          Submit Another Event
        </button>
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
              <label className="block text-white font-medium mb-2">Event Name *</label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Enter event name"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Event Date *</label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Event Location *</label>
              <input
                type="text"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="City, State"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Event Website</label>
              <input
                type="url"
                name="eventWebsite"
                value={formData.eventWebsite}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Event Category *</label>
              <select
                name="eventCategory"
                value={formData.eventCategory}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                required
              >
                <option value="">Select Category</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Party">Party</option>
                <option value="Meetup">Meetup</option>
                <option value="Educational">Educational</option>
                <option value="Social">Social</option>
              </select>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Event Tags</label>
              <input
                type="text"
                name="eventTags"
                value={formData.eventTags}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Comma-separated tags (e.g., beginners, rope, impact)"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-white font-medium mb-2">Event Description *</label>
            <textarea
              name="eventDescription"
              value={formData.eventDescription}
              onChange={handleInputChange}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors h-32"
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
              <label className="block text-white font-medium mb-2">Organizer Name *</label>
              <input
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Your name or organization name"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Organizer Email *</label>
              <input
                type="email"
                name="organizerEmail"
                value={formData.organizerEmail}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Organizer Phone</label>
              <input
                type="tel"
                name="organizerPhone"
                value={formData.organizerPhone}
                onChange={handleInputChange}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="(555) 123-4567"
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
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
