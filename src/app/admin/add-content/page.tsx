'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Content - Admin | East Coast Kink Events',
  description: 'Add new event or dungeon content to East Coast Kink Events',
  robots: 'noindex, nofollow'
}
import Image from 'next/image'

export default function AddContentPage() {
  const [contentType, setContentType] = useState<'event' | 'dungeon'>('event')
  
  // Event form data
  const [eventData, setEventData] = useState({
    title: '',
    shortTitle: '',
    slug: '',
    startDate: '',
    endDate: '',
    displayDate: '',
    city: '',
    state: '',
    venue: '',
    shortDescription: '',
    longDescription: '',
    seoDescription: '',
    category: '',
    tags: '',
    logo: '',
    images: '',
    website: '',
    organizer: '',
    email: '',
    phone: '',
    organizerWebsite: '',
    earlyBirdPrice: '',
    regularPrice: '',
    atDoorPrice: '',
    includes: '',
    features: '',
    seoTitle: '',
    seoKeywords: ''
  })

  // Dungeon form data
  const [dungeonData, setDungeonData] = useState({
    name: '',
    slug: '',
    city: '',
    state: '',
    address: '',
    excerpt: '',
    logo: '',
    images: '',
    website: '',
    email: '',
    phone: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear the URL field when file is uploaded
      if (contentType === 'event') {
        setEventData(prev => ({ ...prev, logo: '' }))
      } else {
        setDungeonData(prev => ({ ...prev, logo: '' }))
      }
    }
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(eventData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      
      // Add logo file if uploaded
      if (logoFile) {
        submitData.append('logoFile', logoFile)
      }
      
      // Submit to API
      const response = await fetch('/api/events', {
        method: 'POST',
        body: submitData
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Event added successfully! The event will now appear on the website.')
        // Reset form
        setEventData({
          title: '',
          shortTitle: '',
          slug: '',
          startDate: '',
          endDate: '',
          displayDate: '',
          city: '',
          state: '',
          venue: '',
          shortDescription: '',
          longDescription: '',
          seoDescription: '',
          category: '',
          tags: '',
          logo: '',
          images: '',
          website: '',
          organizer: '',
          email: '',
          phone: '',
          organizerWebsite: '',
          earlyBirdPrice: '',
          regularPrice: '',
          atDoorPrice: '',
          includes: '',
          features: '',
          seoTitle: '',
          seoKeywords: ''
        })
        setLogoFile(null)
        setLogoPreview(null)
      } else {
        alert('Failed to add event: ' + result.message)
      }
    } catch (error) {
      console.error('Error submitting event:', error)
      alert('Error submitting event. Please try again.')
    }
  }

  const handleDungeonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(dungeonData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      
      // Add logo file if uploaded
      if (logoFile) {
        submitData.append('logoFile', logoFile)
      }
      
      // Submit to API
      const response = await fetch('/api/dungeons', {
        method: 'POST',
        body: submitData
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Dungeon added successfully! The dungeon will now appear on the website.')
        // Reset form
        setDungeonData({
          name: '',
          slug: '',
          city: '',
          state: '',
          address: '',
          excerpt: '',
          logo: '',
          images: '',
          website: '',
          email: '',
          phone: '',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: ''
        })
        setLogoFile(null)
        setLogoPreview(null)
      } else {
        alert('Failed to add dungeon: ' + result.message)
      }
    } catch (error) {
      console.error('Error submitting dungeon:', error)
      alert('Error submitting dungeon. Please try again.')
    }
  }

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEventData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDungeonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDungeonData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearLogoUpload = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleContentTypeChange = (type: 'event' | 'dungeon') => {
    setContentType(type)
    setLogoFile(null)
    setLogoPreview(null)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-white mb-8">
            Add New Content
          </h1>
          
          {/* Content Type Toggle */}
          <div className="mb-8">
            <div className="flex bg-dark-800 p-1 rounded-none">
              <button
                type="button"
                onClick={() => handleContentTypeChange('event')}
                className={`flex-1 py-3 px-6 text-center font-medium transition-colors duration-200 ${
                  contentType === 'event'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Add Event
              </button>
              <button
                type="button"
                onClick={() => handleContentTypeChange('dungeon')}
                className={`flex-1 py-3 px-6 text-center font-medium transition-colors duration-200 ${
                  contentType === 'dungeon'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Add Dungeon
              </button>
            </div>
          </div>
          
          {contentType === 'event' ? (
            <form onSubmit={handleEventSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={eventData.title}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Short Title</label>
                    <input
                      type="text"
                      name="shortTitle"
                      value={eventData.shortTitle}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">URL Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={eventData.slug}
                      onChange={handleEventChange}
                      placeholder="event-name-2025"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Category *</label>
                    <select
                      name="category"
                      value={eventData.category}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Outdoor Conference">Outdoor Conference</option>
                      <option value="Indoor Conference">Indoor Conference</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Event Dates
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={eventData.startDate}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={eventData.endDate}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Display Date</label>
                    <input
                      type="text"
                      name="displayDate"
                      value={eventData.displayDate}
                      onChange={handleEventChange}
                      placeholder="July 31 - August 3, 2025"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Location
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={eventData.city}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={eventData.state}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Venue</label>
                    <input
                      type="text"
                      name="venue"
                      value={eventData.venue}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Descriptions
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Short Description *</label>
                    <textarea
                      name="shortDescription"
                      value={eventData.shortDescription}
                      onChange={handleEventChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Long Description *</label>
                    <textarea
                      name="longDescription"
                      value={eventData.longDescription}
                      onChange={handleEventChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={eventData.seoDescription}
                      onChange={handleEventChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Media & Links
                </h2>
                
                <div className="space-y-6">
                  {/* Logo Upload Section */}
                  <div>
                    <label className="block text-white font-medium mb-4">Event Logo</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* File Upload */}
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Upload Logo File</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                        />
                        <p className="text-gray-400 text-xs mt-2">Supported: PNG, JPG, JPEG, GIF (Max 5MB)</p>
                      </div>
                      
                      {/* URL Input */}
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Or Enter Logo URL</label>
                        <input
                          type="url"
                          name="logo"
                          value={eventData.logo}
                          onChange={handleEventChange}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                          disabled={!!logoFile}
                        />
                      </div>
                    </div>
                    
                    {/* Logo Preview */}
                    {logoPreview && (
                      <div className="mt-6 p-4 border border-dark-600 bg-dark-800">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">Logo Preview</h4>
                          <button
                            type="button"
                            onClick={clearLogoUpload}
                            className="text-primary-400 hover:text-primary-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center justify-center p-4 bg-white rounded">
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            width={128}
                            height={128}
                            className="max-h-32 max-w-full object-contain"
                          />
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          File: {logoFile?.name} ({(logoFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Event Website</label>
                      <input
                        type="url"
                        name="website"
                        value={eventData.website}
                        onChange={handleEventChange}
                        className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-white font-medium mb-2">Event Images (comma-separated URLs)</label>
                      <input
                        type="text"
                        name="images"
                        value={eventData.images}
                        onChange={handleEventChange}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Information */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Organizer Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Organizer Name</label>
                    <input
                      type="text"
                      name="organizer"
                      value={eventData.organizer}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Contact Email</label>
                    <input
                      type="email"
                      name="email"
                      value={eventData.email}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={eventData.phone}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Organizer Website</label>
                    <input
                      type="url"
                      name="organizerWebsite"
                      value={eventData.organizerWebsite}
                      onChange={handleEventChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Pricing
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Early Bird Price</label>
                    <input
                      type="text"
                      name="earlyBirdPrice"
                      value={eventData.earlyBirdPrice}
                      onChange={handleEventChange}
                      placeholder="$150"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Regular Price</label>
                    <input
                      type="text"
                      name="regularPrice"
                      value={eventData.regularPrice}
                      onChange={handleEventChange}
                      placeholder="$200"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">At Door Price</label>
                    <input
                      type="text"
                      name="atDoorPrice"
                      value={eventData.atDoorPrice}
                      onChange={handleEventChange}
                      placeholder="$250"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-white font-medium mb-2">What's Included</label>
                    <input
                      type="text"
                      name="includes"
                      value={eventData.includes}
                      onChange={handleEventChange}
                      placeholder="All workshops, play parties, and social events"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Features & Tags */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Features & Tags
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Event Features (comma-separated)</label>
                    <textarea
                      name="features"
                      value={eventData.features}
                      onChange={handleEventChange}
                      rows={4}
                      placeholder="Educational workshops, Hands-on demonstrations, Play parties, Social events"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Tags (comma-separated)</label>
                    <textarea
                      name="tags"
                      value={eventData.tags}
                      onChange={handleEventChange}
                      rows={4}
                      placeholder="Education, Workshops, Community, BDSM, Rope"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  SEO Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={eventData.seoTitle}
                      onChange={handleEventChange}
                      placeholder="Event Name 2025 - Description | Location"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">SEO Keywords (comma-separated)</label>
                    <textarea
                      name="seoKeywords"
                      value={eventData.seoKeywords}
                      onChange={handleEventChange}
                      rows={3}
                      placeholder="kink education, BDSM workshops, Pennsylvania, rope bondage, community events"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="btn-primary px-12 py-4 text-lg"
                >
                  Add Event
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDungeonSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Dungeon Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={dungeonData.name}
                      onChange={handleDungeonChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">URL Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={dungeonData.slug}
                      onChange={handleDungeonChange}
                      placeholder="dungeon-name"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Location
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={dungeonData.city}
                      onChange={handleDungeonChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={dungeonData.state}
                      onChange={handleDungeonChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">Full Address</label>
                    <input
                      type="text"
                      name="address"
                      value={dungeonData.address}
                      onChange={handleDungeonChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Description
                </h2>
                
                <div>
                  <label className="block text-white font-medium mb-2">Dungeon Excerpt *</label>
                  <textarea
                    name="excerpt"
                    value={dungeonData.excerpt}
                    onChange={handleDungeonChange}
                    rows={4}
                    placeholder="Brief description of the dungeon, its services, and atmosphere..."
                    className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    required
                  />
                </div>
              </div>

              {/* Media */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Media & Links
                </h2>
                
                <div className="space-y-6">
                  {/* Logo Upload Section */}
                  <div>
                    <label className="block text-white font-medium mb-4">Dungeon Logo</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* File Upload */}
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Upload Logo File</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                        />
                        <p className="text-gray-400 text-xs mt-2">Supported: PNG, JPG, JPEG, GIF (Max 5MB)</p>
                      </div>
                      
                      {/* URL Input */}
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Or Enter Logo URL</label>
                        <input
                          type="url"
                          name="logo"
                          value={dungeonData.logo}
                          onChange={handleDungeonChange}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                          disabled={!!logoFile}
                        />
                      </div>
                    </div>
                    
                    {/* Logo Preview */}
                    {logoPreview && (
                      <div className="mt-6 p-4 border border-dark-600 bg-dark-800">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">Logo Preview</h4>
                          <button
                            type="button"
                            onClick={clearLogoUpload}
                            className="text-primary-400 hover:text-primary-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center justify-center p-4 bg-white rounded">
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            width={128}
                            height={128}
                            className="max-h-32 max-w-full object-contain"
                          />
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          File: {logoFile?.name} ({(logoFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Dungeon Website</label>
                      <input
                        type="url"
                        name="website"
                        value={dungeonData.website}
                        onChange={handleDungeonChange}
                        className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-white font-medium mb-2">Dungeon Images (comma-separated URLs)</label>
                      <input
                        type="text"
                        name="images"
                        value={dungeonData.images}
                        onChange={handleDungeonChange}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Contact Email</label>
                    <input
                      type="email"
                      name="email"
                      value={dungeonData.email}
                      onChange={handleDungeonChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={dungeonData.phone}
                      onChange={handleDungeonChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  SEO Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={dungeonData.seoTitle}
                      onChange={handleDungeonChange}
                      placeholder="Dungeon Name - BDSM Dungeon | City, State"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={dungeonData.seoDescription}
                      onChange={handleDungeonChange}
                      rows={3}
                      placeholder="Brief description for search engines..."
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">SEO Keywords (comma-separated)</label>
                    <textarea
                      name="seoKeywords"
                      value={dungeonData.seoKeywords}
                      onChange={handleDungeonChange}
                      rows={3}
                      placeholder="BDSM dungeon, kink space, City, State, BDSM sessions"
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="btn-primary px-12 py-4 text-lg"
                >
                  Add Dungeon
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
