'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function AddEventPageClient() {
  const [formData, setFormData] = useState({
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

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
      setFormData(prev => ({ ...prev, logo: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => submitData.append(key, value))
      if (logoFile) submitData.append('logoFile', logoFile)
      const response = await fetch('/api/events', { method: 'POST', body: submitData })
      const result = await response.json()
      if (result.success) {
        alert('Event added successfully! The event will now appear on the website.')
        setFormData({
          title: '', shortTitle: '', slug: '', startDate: '', endDate: '', displayDate: '', city: '', state: '', venue: '', shortDescription: '', longDescription: '', seoDescription: '', category: '', tags: '', logo: '', images: '', website: '', organizer: '', email: '', phone: '', organizerWebsite: '', earlyBirdPrice: '', regularPrice: '', atDoorPrice: '', includes: '', features: '', seoTitle: '', seoKeywords: ''
        })
        setLogoFile(null); setLogoPreview(null)
      } else {
        alert('Failed to add event: ' + result.message)
      }
    } catch (error) {
      console.error('Error submitting event:', error)
      alert('Error submitting event. Please try again.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const clearLogoUpload = () => { setLogoFile(null); setLogoPreview(null) }

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-white mb-8">Add New Event</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Event Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white" required />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Short Title</label>
                  <input type="text" name="shortTitle" value={formData.shortTitle} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">URL Slug *</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="event-name-2025" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white" required />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white" required>
                    <option value="">Select Category</option>
                    <option value="Conference">Conference</option>
                    <option value="Camp">Camp</option>
                    <option value="Party">Party</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Munch">Munch</option>
                    <option value="Meetup">Meetup</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">Event Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Start Date *</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white" required />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">End Date *</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" required />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Display Date</label>
                  <input type="text" name="displayDate" value={formData.displayDate} onChange={handleChange} placeholder="July 31 - August 3, 2025" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
              </div>
            </div>

            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" required />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">State *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" required />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Venue</label>
                  <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
              </div>
            </div>

            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">Descriptions</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Short Description *</label>
                  <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" required />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Long Description *</label>
                  <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={6} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" required />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">SEO Description</label>
                  <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
              </div>
            </div>

            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">Media & Links</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-4">Event Logo</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Upload Logo File</label>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700" />
                      <p className="text-gray-400 text-xs mt-2">Supported: PNG, JPG, JPEG, GIF (Max 5MB)</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Or Enter Logo URL</label>
                      <input type="url" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://example.com/logo.png" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" disabled={!!logoFile} />
                    </div>
                  </div>
                  {logoPreview && (
                    <div className="mt-6 p-4 border border-dark-600 bg-dark-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">Logo Preview</h4>
                        <button type="button" onClick={clearLogoUpload} className="text-primary-400 hover:text-primary-300 text-sm">Remove</button>
                      </div>
                      <div className="flex items-center justify-center p-4 bg-white rounded">
                        <Image src={logoPreview} alt="Logo preview" width={128} height={128} className="max-h-32 max-w-full object-contain" />
                      </div>
                      <p className="text-gray-400 text-xs mt-2">File: {logoFile?.name} ({((logoFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Event Website</label>
                    <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">Event Images (comma-separated URLs)</label>
                    <input type="text" name="images" value={formData.images} onChange={handleChange} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">Organizer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Organizer Name</label>
                  <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Contact Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Organizer Website</label>
                  <input type="url" name="organizerWebsite" value={formData.organizerWebsite} onChange={handleChange} className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
              </div>
            </div>

            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Early Bird Price</label>
                  <input type="text" name="earlyBirdPrice" value={formData.earlyBirdPrice} onChange={handleChange} placeholder="$150" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Regular Price</label>
                  <input type="text" name="regularPrice" value={formData.regularPrice} onChange={handleChange} placeholder="$200" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">At Door Price</label>
                  <input type="text" name="atDoorPrice" value={formData.atDoorPrice} onChange={handleChange} placeholder="$250" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-white font-medium mb-2">What's Included</label>
                  <input type="text" name="includes" value={formData.includes} onChange={handleChange} placeholder="All workshops, play parties, and social events" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
              </div>
            </div>

            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">Features & Tags</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Event Features (comma-separated)</label>
                  <textarea name="features" value={formData.features} onChange={handleChange} rows={4} placeholder="Educational workshops, Hands-on demonstrations, Play parties, Social events" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Tags (comma-separated)</label>
                  <textarea name="tags" value={formData.tags} onChange={handleChange} rows={4} placeholder="Education, Workshops, Community, BDSM, Rope" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
              </div>
            </div>

            <div className="card-elegant">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6">SEO Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">SEO Title</label>
                  <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="Event Name 2025 - Description | Location" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">SEO Keywords (comma-separated)</label>
                  <textarea name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} rows={3} placeholder="kink education, BDSM workshops, Pennsylvania, rope bondage, community events" className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus;border-transparent bg-dark-800 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="btn-primary px-12 py-4 text-lg">Add Event</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


