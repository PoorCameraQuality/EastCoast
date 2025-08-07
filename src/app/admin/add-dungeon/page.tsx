'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Dungeon - Admin | East Coast Kink Events',
  description: 'Add a new dungeon to East Coast Kink Events',
  robots: 'noindex, nofollow'
}
import Image from 'next/image'

export default function AddDungeonPage() {
  const [formData, setFormData] = useState({
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
      setFormData(prev => ({ ...prev, logo: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
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
        setFormData({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearLogoUpload = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-white mb-8">
            Add New Dungeon
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
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
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">URL Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
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
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Full Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
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
                  value={formData.excerpt}
                  onChange={handleChange}
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
                        value={formData.logo}
                        onChange={handleChange}
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
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">Dungeon Images (comma-separated URLs)</label>
                    <input
                      type="text"
                      name="images"
                      value={formData.images}
                      onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                    value={formData.seoTitle}
                    onChange={handleChange}
                    placeholder="Dungeon Name - BDSM Dungeon | City, State"
                    className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">SEO Description</label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief description for search engines..."
                    className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">SEO Keywords (comma-separated)</label>
                  <textarea
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleChange}
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
        </div>
      </div>
    </div>
  )
}

