'use client'

import { useState } from 'react'
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'

interface ContactFormProps {
  'aria-label'?: string;
}

export default function ContactForm({ 'aria-label': ariaLabel }: ContactFormProps = {}) {
  const { trackEvent } = useGoogleAnalytics()
  const [contactType, setContactType] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    eventName: '',
    eventDate: '',
    eventLocation: '',
    eventWebsite: '',
    dungeonName: '',
    dungeonLocation: '',
    dungeonWebsite: '',
    contactMethod: '',
    contactMethodDetails: ''
  })

  const handleContactTypeChange = (type: string) => {
    setContactType(type)
    setFormData(prev => ({ ...prev, subject: type }))
    
    // Show popup with specific message
    let message = ''
    switch (type) {
      case 'Event Submission':
        message = 'Thank you for reaching out! We would be happy to host your event. Please review our requirements for being listed.'
        break
      case 'Dungeon Submission':
        message = 'Thank you for reaching out! We would be happy to host your dungeon. Please review our requirements for being listed.'
        break
      case 'General Inquiry':
        message = 'We\'d love to hear from you! Please let us know how we can help.'
        break
      case 'Technical Support':
        message = 'We\'re here to help with any technical issues you may be experiencing.'
        break
      case 'Feedback':
        message = 'We\'d love to hear your feedback! Your input helps us improve our services.'
        break
      default:
        message = 'Thank you for reaching out! We\'ll get back to you soon.'
    }
    setPopupMessage(message)
    setShowPopup(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Track form submission
    trackEvent('submit', 'contact_form', contactType, 1)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          contactType
        }),
      })

      if (response.ok) {
        setPopupMessage('Thank you for your submission! We\'ll get back to you soon.')
        setShowPopup(true)
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          eventName: '',
          eventDate: '',
          eventLocation: '',
          eventWebsite: '',
          dungeonName: '',
          dungeonLocation: '',
          dungeonWebsite: '',
          contactMethod: '',
          contactMethodDetails: ''
        })
        setContactType('')
      } else {
        setPopupMessage('There was an error submitting your form. Please try again.')
        setShowPopup(true)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setPopupMessage('There was an error submitting your form. Please try again.')
      setShowPopup(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if contact method details should be shown
  const showContactMethodDetails = formData.contactMethod && formData.contactMethod !== 'email'

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
        <span className="inline-block bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent">
          Contact Us
        </span>
      </h1>
      
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[var(--z-ecke-modal)]"
          aria-live="polite"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-xl w-full shadow-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-white">
                  {popupMessage}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white/10 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ecke-focus"
                  onClick={() => setShowPopup(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" aria-label={ariaLabel}>
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus:border-transparent backdrop-blur-xl transition-all duration-300"
              placeholder="Your name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              pattern="^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,}$"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus:border-transparent backdrop-blur-xl transition-all duration-300"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus:border-transparent backdrop-blur-xl transition-all duration-300"
            value={formData.subject}
            onChange={(e) => handleContactTypeChange(e.target.value)}
          >
            <option value="">Select a subject</option>
            <option value="Event Submission">Event Submission</option>
            <option value="Dungeon Submission">Dungeon Submission</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Feedback">Feedback</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus:border-transparent backdrop-blur-xl transition-all duration-300 resize-vertical"
            placeholder="Tell us more about your inquiry..."
            value={formData.message}
            onChange={handleInputChange}
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group inline-block bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 text-white font-bold py-4 px-8 rounded-full hover:from-primary-700 hover:via-primary-700 hover:to-primary-800 transition-all duration-300 shadow-xl hover:shadow-primary-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2 justify-center group-hover:translate-x-1 transition-transform">
              {isSubmitting ? 'Sending...' : 'Send Message'}
              {!isSubmitting && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
