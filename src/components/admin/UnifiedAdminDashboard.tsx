'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { isAdmin, getCurrentUser } from '@/lib/auth'
import RichTextEditor from '@/components/education/RichTextEditor'
import Image from 'next/image'

interface User {
  id: string
  email: string
  name?: string
  role: string
}

interface Submission {
  id: string
  submitted_at: string
  submission_type: 'article' | 'contact' | 'event' | 'dungeon'
  author_name: string
  author_email: string
  author_credentials?: string
  author_bio: string
  article_title: string
  article_excerpt: string
  article_content: string
  article_category: string
  article_tags?: string
  contact_name?: string
  contact_email?: string
  contact_type?: string
  contact_method?: string
  contact_method_details?: string
  event_name?: string
  event_date?: string
  event_location?: string
  event_website?: string
  dungeon_name?: string
  dungeon_location?: string
  dungeon_website?: string
  status: string
  word_count: number
  reviewed_at?: string
  reviewer_notes?: string
}

interface UnifiedAdminDashboardProps {
  user: User | null
  isAdmin: boolean
}

type ActiveSection = 'overview' | 'submissions' | 'create-content'
type ContentType = 'event' | 'dungeon' | 'article'
type FilterType = 'all' | 'pending' | 'approved' | 'responded' | 'rejected'

export default function UnifiedAdminDashboard({ user, isAdmin: isAdminProp }: UnifiedAdminDashboardProps) {
  // State management
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('pending')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [contentType, setContentType] = useState<ContentType>('event')
  const [isClient, setIsClient] = useState(false)

  // Create content form states
  const [eventData, setEventData] = useState({
    title: '', shortTitle: '', slug: '', startDate: '', endDate: '', displayDate: '', 
    city: '', state: '', venue: '', shortDescription: '', longDescription: '', 
    seoDescription: '', category: '', tags: '', logo: '', images: '', website: '', 
    organizer: '', email: '', organizerWebsite: '', earlyBirdPrice: '', 
    regularPrice: '', atDoorPrice: '', includes: '', features: '', seoTitle: '', seoKeywords: '',
    eventType: 'indoor' as 'indoor' | 'outdoor'
  })

  const [dungeonData, setDungeonData] = useState({
    name: '', slug: '', city: '', state: '', address: '', excerpt: '', logo: '', 
    images: '', website: '', email: '', seoTitle: '', seoDescription: '', seoKeywords: ''
  })

  const [articleData, setArticleData] = useState({
    title: '', excerpt: '', content: '', author_name: '', author_credentials: '', 
    author_bio: '', category: '', tags: '', featured: false
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch data on component mount (only on client)
  useEffect(() => {
    if (isClient) {
      fetchSubmissions()
    }
  }, [isClient])

  // Data fetching functions
  const fetchSubmissions = async () => {
    try {
      if (!supabase) {
        console.error('Supabase is not configured')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('Error fetching submissions:', error)
        return
      }

      setSubmissions(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Submission management functions
  const handleApprove = async (submission: Submission) => {
    if (!isClient) return

    if (submission.submission_type === 'article') {
      try {
        const response = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
          method: 'POST',
        })

        if (response.ok) {
          alert('Article submission approved and published!')
          // Update the submission status locally
          setSubmissions(prev => prev.map(s => 
            s.id === submission.id 
              ? { ...s, status: 'approved', reviewed_at: new Date().toISOString() }
              : s
          ))
          setSelectedSubmission(null)
        } else {
          alert('Error approving submission')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error approving submission')
      }
    } else if (submission.submission_type === 'event') {
      try {
        const response = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
          method: 'POST',
        })

        if (response.ok) {
          alert('Event submission approved and published!')
          // Update the submission status locally
          setSubmissions(prev => prev.map(s => 
            s.id === submission.id 
              ? { ...s, status: 'approved', reviewed_at: new Date().toISOString() }
              : s
          ))
          setSelectedSubmission(null)
        } else {
          alert('Error approving submission')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error approving submission')
      }
    } else if (submission.submission_type === 'dungeon') {
      try {
        const response = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
          method: 'POST',
        })

        if (response.ok) {
          alert('Dungeon submission approved and published!')
          // Update the submission status locally
          setSubmissions(prev => prev.map(s => 
            s.id === submission.id 
              ? { ...s, status: 'approved', reviewed_at: new Date().toISOString() }
              : s
          ))
          setSelectedSubmission(null)
        } else {
          alert('Error approving submission')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error approving submission')
      }
    } else {
      // Handle contact form approval (mark as responded)
      try {
        const response = await fetch(`/api/admin/submissions/${submission.id}/respond`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviewerNotes: 'Contact form responded to via email'
          })
        })

        if (response.ok) {
          alert('Contact submission marked as responded!')
          // Update the submission status locally
          setSubmissions(prev => prev.map(s => 
            s.id === submission.id 
              ? { ...s, status: 'responded', reviewed_at: new Date().toISOString() }
              : s
          ))
          setSelectedSubmission(null)
        } else {
          const errorData = await response.json()
          console.error('Respond error:', errorData)
          alert('Error responding to submission: ' + (errorData.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error responding to submission')
      }
    }
  }

  const handleReject = async (submission: Submission) => {
    if (!isClient) return

    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerNotes: `Rejected on ${new Date().toLocaleDateString()} - ${submission.submission_type === 'contact' ? 'Contact form not suitable' : 'Article does not meet guidelines'}`
        })
      })

      if (response.ok) {
        alert('Submission rejected!')
        // Update the submission status locally
        setSubmissions(prev => prev.map(s => 
          s.id === submission.id 
            ? { ...s, status: 'rejected', reviewed_at: new Date().toISOString() }
            : s
        ))
        setSelectedSubmission(null)
      } else {
        alert('Error rejecting submission')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error rejecting submission')
    }
  }

  const handleDelete = async (submission: Submission) => {
    if (!isClient) return

    if (!confirm(`Are you sure you want to delete this ${submission.submission_type} submission? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Submission deleted successfully!')
        // Remove the submission from local state
        setSubmissions(prev => prev.filter(s => s.id !== submission.id))
        setSelectedSubmission(null)
      } else {
        const errorData = await response.json()
        console.error('Delete error:', errorData)
        alert('Error deleting submission: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting submission')
    }
  }

  // Content creation functions
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = new FormData()
    Object.entries(eventData).forEach(([k, v]) => submitData.append(k, v))
    if (logoFile) submitData.append('logoFile', logoFile)
    
    const response = await fetch('/api/events', { method: 'POST', body: submitData })
    const result = await response.json()
    
    if (result.success) {
      alert('Event added successfully!')
      setEventData({
        title: '', shortTitle: '', slug: '', startDate: '', endDate: '', displayDate: '', 
        city: '', state: '', venue: '', shortDescription: '', longDescription: '', 
        seoDescription: '', category: '', tags: '', logo: '', images: '', website: '', 
        organizer: '', email: '', organizerWebsite: '', earlyBirdPrice: '', 
        regularPrice: '', atDoorPrice: '', includes: '', features: '', seoTitle: '', seoKeywords: '',
        eventType: 'indoor'
      })
      setLogoFile(null)
      setLogoPreview(null)
    } else {
      alert('Failed to add event: ' + result.message)
    }
  }

  const handleDungeonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = new FormData()
    Object.entries(dungeonData).forEach(([k, v]) => submitData.append(k, v))
    if (logoFile) submitData.append('logoFile', logoFile)
    
    const response = await fetch('/api/dungeons', { method: 'POST', body: submitData })
    const result = await response.json()
    
    if (result.success) {
      alert('Dungeon added successfully!')
      setDungeonData({
        name: '', slug: '', city: '', state: '', address: '', excerpt: '', logo: '', 
        images: '', website: '', email: '', seoTitle: '', seoDescription: '', seoKeywords: ''
      })
      setLogoFile(null)
      setLogoPreview(null)
    } else {
      alert('Failed to add dungeon: ' + result.message)
    }
  }

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      alert('Database is not configured')
      return
    }

    try {
      // Generate slug from title
      const slug = articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { error } = await supabase
        .from('articles')
        .insert([{
          title: articleData.title,
          slug: slug,
          excerpt: articleData.excerpt,
          content: articleData.content,
          author_name: articleData.author_name,
          author_credentials: articleData.author_credentials || null,
          author_bio: articleData.author_bio,
          category: articleData.category,
          tags: articleData.tags ? articleData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : null,
          featured: articleData.featured,
          status: 'published',
          // publish_date and last_updated will be automatically set by the database defaults
        }])

      if (error) {
        console.error('Error creating article:', error)
        alert('Error creating article: ' + error.message)
      } else {
        alert('Article created successfully!')
        setArticleData({
          title: '', excerpt: '', content: '', author_name: '', author_credentials: '', 
          author_bio: '', category: '', tags: '', featured: false
        })
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating article')
    }
  }

  // File upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
      
      // Clear URL fields
      if (contentType === 'event') setEventData(prev => ({ ...prev, logo: '' }))
      else if (contentType === 'dungeon') setDungeonData(prev => ({ ...prev, logo: '' }))
    }
  }

  // Utility functions
  const getSubmissionCounts = () => {
    return {
      all: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      responded: submissions.filter(s => s.status === 'responded').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true
    if (filter === 'pending') return submission.status === 'pending'
    return submission.status === filter
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-black'
      case 'approved': return 'bg-green-500 text-white'
      case 'responded': return 'bg-blue-500 text-white'
      case 'rejected': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review'
      case 'approved': return 'Approved & Published'
      case 'responded': return 'Responded'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  const counts = getSubmissionCounts()

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading...</div>
          <div className="text-gray-400">Initializing admin dashboard...</div>
        </div>
      </div>
    )
  }

  if (!isAdminProp) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">🔒 Access Denied</div>
          <div className="text-gray-400">You must be logged in as an administrator to access this page.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, {user?.name || user?.email || 'Guest'}
              </p>
              {isAdminProp ? (
                <div className="text-green-400 text-sm mt-2">✅ You have admin access</div>
              ) : (
                <div className="text-red-400 text-sm mt-2">⚠️ Admin access required</div>
              )}
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-outline"
            >
              ← Back to Home
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeSection === 'overview'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('submissions')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeSection === 'submissions'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Review Submissions ({counts.pending})
            </button>
            <button
              onClick={() => setActiveSection('create-content')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeSection === 'create-content'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Create Content
            </button>
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="bg-dark-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">User Info</h2>
              <div className="text-gray-300">
                <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
                <p><strong>Role:</strong> <span className="text-green-400">{isAdminProp ? 'admin' : 'user'}</span></p>
                <p><strong>ID:</strong> {user?.id || 'Not available'}</p>
              </div>
            </div>

            {/* Submission Stats */}
            <div className="bg-dark-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Submissions Overview</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Pending:</span>
                  <span className="text-yellow-400 font-medium">{counts.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Approved:</span>
                  <span className="text-green-400 font-medium">{counts.approved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Responded:</span>
                  <span className="text-blue-400 font-medium">{counts.responded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-white font-medium">{counts.all}</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-dark-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
              <div className="text-green-400 space-y-1">
                <p>✅ Admin Access Confirmed</p>
                <p>✅ Authentication Working</p>
                <p>✅ Database Connected</p>
                <p>✅ Persistent Auth State</p>
                <p>✅ Server-side Protected</p>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Section */}
        {activeSection === 'submissions' && (
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{counts.all}</div>
                <div className="text-gray-400 text-sm">Total</div>
              </div>
              <div className="bg-yellow-500 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-black">{counts.pending}</div>
                <div className="text-black text-sm">Pending</div>
              </div>
              <div className="bg-green-500 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{counts.approved}</div>
                <div className="text-white text-sm">Approved</div>
              </div>
              <div className="bg-blue-500 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{counts.responded}</div>
                <div className="text-white text-sm">Responded</div>
              </div>
              <div className="bg-red-500 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{counts.rejected}</div>
                <div className="text-white text-sm">Rejected</div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'approved', 'responded', 'rejected'] as FilterType[]).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption 
                      ? filterOption === 'pending' ? 'bg-yellow-500 text-black' :
                        filterOption === 'approved' ? 'bg-green-500 text-white' :
                        filterOption === 'responded' ? 'bg-blue-500 text-white' :
                        filterOption === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)} ({counts[filterOption]})
                </button>
              ))}
            </div>

            {/* Submissions List */}
            {loading ? (
              <div className="text-center text-white py-12">Loading submissions...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-lg font-medium mb-2">No {filter === 'all' ? '' : filter} submissions found.</div>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-dark-800 rounded-lg p-6 border border-dark-600 cursor-pointer hover:border-primary-500 transition-colors"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            submission.submission_type === 'article' 
                              ? 'bg-blue-500 text-white' 
                              : submission.submission_type === 'event'
                              ? 'bg-purple-500 text-white'
                              : submission.submission_type === 'dungeon'
                              ? 'bg-orange-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}>
                            {submission.submission_type.charAt(0).toUpperCase() + submission.submission_type.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {getStatusText(submission.status)}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {submission.submission_type === 'article' 
                            ? submission.article_title 
                            : submission.submission_type === 'event'
                            ? submission.event_name || submission.article_title
                            : submission.submission_type === 'dungeon'
                            ? submission.dungeon_name || submission.article_title
                            : `${submission.contact_type || 'Contact'} - ${submission.contact_name || submission.author_name}`
                          }
                        </h3>
                        
                        <div className="text-gray-300 text-sm space-y-1">
                          <p><strong>From:</strong> {submission.author_name} ({submission.author_email})</p>
                          <p><strong>Submitted:</strong> {formatDate(submission.submitted_at)}</p>
                          
                          {submission.submission_type === 'article' && (
                            <>
                              <p><strong>Category:</strong> {submission.article_category}</p>
                              <p><strong>Word Count:</strong> {submission.word_count}</p>
                            </>
                          )}
                          
                          {submission.submission_type === 'event' && (
                            <>
                              <p><strong>Category:</strong> {submission.article_category}</p>
                              <p><strong>Date:</strong> {submission.event_date}</p>
                              <p><strong>Location:</strong> {submission.event_location}</p>
                              {submission.author_credentials && (
                                <p><strong>Type:</strong> {submission.author_credentials}</p>
                              )}
                            </>
                          )}
                          
                          {submission.submission_type === 'dungeon' && (
                            <>
                              <p><strong>Category:</strong> {submission.article_category}</p>
                              <p><strong>Location:</strong> {submission.dungeon_location}</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-gray-400 text-sm">
                        Click to review
                      </div>
                    </div>
                    
                    <div className="border-t border-dark-600 pt-4">
                      <h4 className="text-white font-medium mb-2">Content Preview:</h4>
                      <div className="bg-dark-700 rounded p-3 text-gray-300 text-sm max-h-32 overflow-y-auto">
                        {submission.article_content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Content Section */}
        {activeSection === 'create-content' && (
          <div className="space-y-8">
            {/* Content Type Selector */}
            <div className="flex gap-4">
              {(['event', 'dungeon', 'article'] as ContentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    contentType === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  Add {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Event Form */}
            {contentType === 'event' && (
              <form onSubmit={handleEventSubmit} className="space-y-8">
                <div className="bg-dark-800 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold text-white mb-6">Create New Event</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Event Name *</label>
                      <input
                        type="text"
                        name="title"
                        value={eventData.title}
                        onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Event Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={eventData.startDate}
                        onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Event Location *</label>
                      <input
                        type="text"
                        name="city"
                        value={eventData.city}
                        onChange={(e) => setEventData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        placeholder="City, State"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Event Website</label>
                      <input
                        type="url"
                        name="website"
                        value={eventData.website}
                        onChange={(e) => setEventData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Event Category *</label>
                      <select
                        name="category"
                        value={eventData.category}
                        onChange={(e) => setEventData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
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
                            checked={eventData.eventType === 'indoor'}
                            onChange={(e) => setEventData(prev => ({ ...prev, eventType: e.target.value as 'indoor' | 'outdoor' }))}
                            className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 focus:ring-primary-500"
                          />
                          <span className="text-white">Indoor</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="eventType"
                            value="outdoor"
                            checked={eventData.eventType === 'outdoor'}
                            onChange={(e) => setEventData(prev => ({ ...prev, eventType: e.target.value as 'indoor' | 'outdoor' }))}
                            className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 focus:ring-primary-500"
                          />
                          <span className="text-white">Outdoor</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Event Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={eventData.tags}
                        onChange={(e) => setEventData(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        placeholder="Comma-separated tags (e.g., beginners, rope, impact)"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-white font-medium mb-2">Event Description *</label>
                    <textarea
                      name="shortDescription"
                      value={eventData.shortDescription}
                      onChange={(e) => setEventData(prev => ({ ...prev, shortDescription: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white h-32"
                      placeholder="Describe your event in detail..."
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-white font-medium mb-2">Organizer Name *</label>
                    <input
                      type="text"
                      name="organizer"
                      value={eventData.organizer}
                      onChange={(e) => setEventData(prev => ({ ...prev, organizer: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                      placeholder="Your name or organization name"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-white font-medium mb-2">Organizer Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={eventData.email}
                      onChange={(e) => setEventData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Create Event
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Dungeon Form */}
            {contentType === 'dungeon' && (
              <form onSubmit={handleDungeonSubmit} className="space-y-8">
                <div className="bg-dark-800 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold text-white mb-6">Create New Dungeon</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Dungeon Name</label>
                      <input
                        type="text"
                        name="name"
                        value={dungeonData.name}
                        onChange={(e) => setDungeonData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={dungeonData.city}
                        onChange={(e) => setDungeonData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={dungeonData.state}
                        onChange={(e) => setDungeonData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Website</label>
                      <input
                        type="url"
                        name="website"
                        value={dungeonData.website}
                        onChange={(e) => setDungeonData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      name="excerpt"
                      value={dungeonData.excerpt}
                      onChange={(e) => setDungeonData(prev => ({ ...prev, excerpt: e.target.value }))}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white h-24"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Create Dungeon
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Article Form */}
            {contentType === 'article' && (
              <form onSubmit={handleArticleSubmit} className="space-y-8">
                <div className="bg-dark-800 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold text-white mb-6">Create New Article</h2>
                  
                  {/* Author Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">Author Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Author Name *</label>
                        <input
                          type="text"
                          name="author_name"
                          value={articleData.author_name}
                          onChange={(e) => setArticleData(prev => ({ ...prev, author_name: e.target.value }))}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Author Credentials</label>
                        <input
                          type="text"
                          name="author_credentials"
                          value={articleData.author_credentials}
                          onChange={(e) => setArticleData(prev => ({ ...prev, author_credentials: e.target.value }))}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                          placeholder="e.g., Certified Educator, BDSM Professional"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-white font-medium mb-2">Author Bio *</label>
                      <textarea
                        name="author_bio"
                        value={articleData.author_bio}
                        onChange={(e) => setArticleData(prev => ({ ...prev, author_bio: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white h-24"
                        placeholder="Tell us about the author..."
                        required
                      />
                    </div>
                  </div>

                  {/* Article Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">Article Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Article Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={articleData.title}
                          onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Category *</label>
                        <select
                          name="category"
                          value={articleData.category}
                          onChange={(e) => setArticleData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Safety">Safety</option>
                          <option value="Techniques">Techniques</option>
                          <option value="Community">Community</option>
                          <option value="Resources">Resources</option>
                          <option value="Consent">Consent</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-white font-medium mb-2">Article Excerpt *</label>
                      <textarea
                        name="excerpt"
                        value={articleData.excerpt}
                        onChange={(e) => setArticleData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white h-24"
                        placeholder="A brief summary of the article..."
                        required
                      />
                    </div>
                    <div className="mt-6">
                      <label className="block text-white font-medium mb-2">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={articleData.tags}
                        onChange={(e) => setArticleData(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white"
                        placeholder="Comma-separated tags (e.g., safety, beginners, rope)"
                      />
                    </div>
                    <div className="mt-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={articleData.featured}
                          onChange={(e) => setArticleData(prev => ({ ...prev, featured: e.target.checked }))}
                          className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-white font-medium">Featured Article</span>
                      </label>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">Article Content</h3>
                    <div>
                      <label className="block text-white font-medium mb-2">Article Content *</label>
                      <RichTextEditor
                        content={articleData.content}
                        onChange={(content) => setArticleData(prev => ({ ...prev, content }))}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Create Article
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Submission Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Review Submission</h2>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Submission Details */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-dark-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            selectedSubmission.submission_type === 'article' 
                              ? 'bg-blue-500 text-white' 
                              : selectedSubmission.submission_type === 'event'
                              ? 'bg-purple-500 text-white'
                              : selectedSubmission.submission_type === 'dungeon'
                              ? 'bg-orange-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}>
                            {selectedSubmission.submission_type === 'article' ? 'Article' : 'Contact'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                            {getStatusText(selectedSubmission.status)}
                          </span>
                        </div>
                        
                        <p><strong className="text-white">Title:</strong> {selectedSubmission.article_title}</p>
                        <p><strong className="text-white">From:</strong> {selectedSubmission.author_name}</p>
                        <p><strong className="text-white">Email:</strong> {selectedSubmission.author_email}</p>
                        <p><strong className="text-white">Submitted:</strong> {formatDate(selectedSubmission.submitted_at)}</p>
                        
                        {selectedSubmission.submission_type === 'article' && (
                          <>
                            <p><strong className="text-white">Category:</strong> {selectedSubmission.article_category}</p>
                            <p><strong className="text-white">Word Count:</strong> {selectedSubmission.word_count}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-2">
                    <div className="bg-dark-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Content</h3>
                      <div className="bg-dark-800 rounded p-4 text-gray-300 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {selectedSubmission.article_content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6 pt-6 border-t border-dark-600">
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedSubmission)}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                      >
                        {selectedSubmission.submission_type === 'article' ? 'Approve & Publish' : 'Mark Responded'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedSubmission)}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(selectedSubmission)}
                    className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
