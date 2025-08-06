'use client'

import { useState } from 'react'
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'

export default function ContactForm() {
  const { trackEvent } = useGoogleAnalytics()
  const [contactType, setContactType] = useState('')
  const [showPopup, setShowPopup] = useState(false)
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
    contactMethod: ''
  })

  const handleContactTypeChange = (type: string) => {
    setContactType(type)
    setFormData(prev => ({ ...prev, subject: type }))
    
    // Show popup with specific message
    setShowPopup(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
        alert('Thank you for your submission! We&apos;ll get back to you soon.')
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
          contactMethod: ''
        })
        setContactType('')
      } else {
        alert('There was an error submitting your form. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error submitting your form. Please try again.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
        Contact Us
      </h1>
      
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                     <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 max-w-xl w-full shadow-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {contactType === 'Add my event' && 'Add Your Event'}
                  {contactType === 'Add my dungeon' && 'Add Your Dungeon'}
                  {contactType === 'General Feedback' && 'Share Your Feedback'}
                  {contactType === 'Contact site administration' && 'Contact Administration'}
                </h3>
                                 <div className="text-gray-300 text-sm space-y-3">
                                       {contactType === 'Add my event' && (
                      <>
                        <p>Thank you for reaching out! We would be happy to host your event. Please review the following criteria for being listed:</p>
                        <div className="bg-primary-900 border-l-4 border-primary-400 p-3 rounded">
                          <p className="text-primary-200 text-xs font-semibold mb-2">Requirements:</p>
                          <ol className="text-primary-200 text-xs space-y-1 list-decimal list-inside">
                            <li>Your event must have its own website</li>
                            <li>Your event must be in a permanent or semi-permanent location</li>
                            <li>Your event must have a publicly accessible means of joining or attending</li>
                            <li>While we do not vet events or organizers, by being listed here you agree to our terms of service</li>
                            <li>If there are too many complaints against your event, we may remove it without recourse. We take safety and consent extremely seriously.</li>
                          </ol>
                        </div>
                      </>
                    )}
                    {contactType === 'Add my dungeon' && (
                      <>
                        <p>Thank you for reaching out! We would be happy to host your dungeon. Please review the following criteria for being listed:</p>
                        <div className="bg-primary-900 border-l-4 border-primary-400 p-3 rounded">
                          <p className="text-primary-200 text-xs font-semibold mb-2">Requirements:</p>
                          <ol className="text-primary-200 text-xs space-y-1 list-decimal list-inside">
                            <li>Your dungeon must have its own website</li>
                            <li>Your dungeon must be in a permanent or semi-permanent location</li>
                            <li>Your dungeon must have a publicly accessible means of joining or attending</li>
                            <li>While we do not vet dungeons or organizers, by being listed here you agree to our terms of service</li>
                            <li>If there are too many complaints against your dungeon, we may remove it without recourse. We take safety and consent extremely seriously.</li>
                          </ol>
                        </div>
                      </>
                    )}
                   {contactType === 'General Feedback' && (
                     <>
                       <p>We'd love to hear your feedback! Your input helps us improve our services.</p>
                       <div className="bg-primary-900 border-l-4 border-primary-400 p-3 rounded">
                         <p className="text-primary-200 text-xs">
                           <strong>Important:</strong> We are an aggregator for events. Any questions about specific events should be directed to the event organizers. Please locate their contact information on their page or ask in the appropriate Discord community channels.
                         </p>
                       </div>
                     </>
                   )}
                   {contactType === 'Contact site administration' && (
                     <>
                       <p>How can we help you? Please let us know what you need assistance with.</p>
                       <div className="bg-primary-900 border-l-4 border-primary-400 p-3 rounded">
                         <p className="text-primary-200 text-xs">
                           <strong>Important:</strong> We are an aggregator for events. Any questions about specific events should be directed to the event organizers. Please locate their contact information on their page or ask in the appropriate Discord community channels.
                         </p>
                       </div>
                     </>
                   )}
                 </div>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="inline-flex text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-dark-800 rounded-lg p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Type Selection */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              What can we help you with?
            </label>
            <select
              value={contactType}
              onChange={(e) => handleContactTypeChange(e.target.value)}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select an option</option>
              <option value="General Feedback">General Feedback</option>
              <option value="Add my event">Add my event</option>
              <option value="Add my dungeon">Add my dungeon</option>
              <option value="Contact site administration">Contact site administration</option>
            </select>
          </div>

          {/* Basic Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Event-specific fields */}
          {(contactType === 'Add my event' || contactType === 'Add my dungeon') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    {contactType === 'Add my event' ? 'Event Name' : 'Dungeon Name'} *
                  </label>
                  <input
                    type="text"
                    name={contactType === 'Add my event' ? 'eventName' : 'dungeonName'}
                    value={contactType === 'Add my event' ? formData.eventName : formData.dungeonName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    {contactType === 'Add my event' ? 'Event Date' : 'Location'} *
                  </label>
                  <input
                    type={contactType === 'Add my event' ? 'date' : 'text'}
                    name={contactType === 'Add my event' ? 'eventDate' : 'dungeonLocation'}
                    value={contactType === 'Add my event' ? formData.eventDate : formData.dungeonLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              {contactType === 'Add my event' && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Event Location
                  </label>
                  <input
                    type="text"
                    name="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name={contactType === 'Add my event' ? 'eventWebsite' : 'dungeonWebsite'}
                  value={contactType === 'Add my event' ? formData.eventWebsite : formData.dungeonWebsite}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tell us more about your request..."
              required
            />
          </div>

          {/* Contact Method */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Preferred Contact Method
            </label>
            <select
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select preferred method</option>
              <option value="email">Email</option>
              <option value="discord">Discord</option>
              <option value="phone">Phone</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
