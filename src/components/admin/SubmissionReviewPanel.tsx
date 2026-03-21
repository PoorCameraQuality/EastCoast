'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { isAdmin, getCurrentUser } from '@/lib/auth'

interface Submission {
  id: string
  submitted_at: string
  submission_type: 'article' | 'contact'
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

interface ModerationLog {
  id: string
  action: 'edit' | 'delete'
  article_title: string
  article_id: string
  admin_name: string
  timestamp: string
  notes?: string
}

type FilterType = 'all' | 'pending' | 'approved' | 'responded' | 'rejected'
type TabType = 'submissions' | 'moderation'

export default function SubmissionReviewPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('pending')
  const [activeTab, setActiveTab] = useState<TabType>('submissions')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin()
      const user = await getCurrentUser()
      setIsAdminUser(adminStatus)
      setCurrentUser(user)
    }
    
    checkAdminStatus()
    fetchSubmissions()
    fetchModerationLogs()
  }, [])

  const fetchSubmissions = async () => {
    try {
      // Check if Supabase is configured
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

  const fetchModerationLogs = async () => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.error('Supabase is not configured')
        return
      }

      const { data, error } = await supabase
        .from('moderation_logs')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching moderation logs:', error)
        return
      }

      setModerationLogs(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleApprove = async (submission: Submission) => {
    if (submission.submission_type === 'article') {
      // Handle article approval (existing logic)
      try {
        const response = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
          method: 'POST',
        })

        if (response.ok) {
          alert('Submission approved and published!')
          fetchSubmissions()
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
      // Check if Supabase is configured
      if (!supabase) {
        alert('Database is not configured')
        return
      }

      try {
        const { error } = await supabase
          .from('submissions')
          .update({ 
            status: 'responded',
            reviewed_at: new Date().toISOString(),
            reviewer_notes: 'Contact form responded to via email'
          })
          .eq('id', submission.id)

        if (error) {
          console.error('Error updating submission:', error)
          alert('Error updating submission')
        } else {
          alert('Contact submission marked as responded!')
          fetchSubmissions()
          setSelectedSubmission(null)
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error updating submission')
      }
    }
  }

  const handleReject = async (submission: Submission) => {
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
        fetchSubmissions()
        setSelectedSubmission(null)
      } else {
        const errorData = await response.json()
        console.error('Reject error:', errorData)
        alert('Error rejecting submission')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error rejecting submission')
    }
  }

  // Count submissions by status
  const getSubmissionCounts = () => {
    const counts = {
      all: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      responded: submissions.filter(s => s.status === 'responded').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    }
    return counts
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true
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

  // Check if user is admin
  if (!isAdminUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-white text-xl mb-4">🔒 Access Denied</div>
          <div className="text-gray-400">You must be logged in as an administrator to access this page.</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading submissions...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 text-center">Review Submissions</h1>
        <p className="text-lg text-subtle max-w-3xl mb-8 text-center mx-auto">Review and manage article submissions from the community.</p>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'submissions'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'moderation'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Moderation Log ({moderationLogs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <>
          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Approved ({counts.approved})
            </button>
            <button
              onClick={() => setFilter('responded')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'responded' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Responded ({counts.responded})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Rejected ({counts.rejected})
            </button>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="text-lg font-medium mb-2">No {filter === 'all' ? '' : filter} submissions found.</div>
              <div className="text-sm">
                {filter === 'pending' && 'All submissions have been processed!'}
                {filter === 'approved' && 'No approved submissions yet.'}
                {filter === 'responded' && 'No responded contact forms yet.'}
                {filter === 'rejected' && 'No rejected submissions yet.'}
              </div>
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
                            : 'bg-green-500 text-white'
                        }`}>
                          {submission.submission_type === 'article' ? 'Article' : 'Contact'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {getStatusText(submission.status)}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {submission.submission_type === 'article' 
                          ? submission.article_title 
                          : `${submission.contact_type} - ${submission.contact_name}`
                        }
                      </h3>
                      
                      <div className="text-gray-300 text-sm space-y-1">
                        <p><strong>From:</strong> {submission.author_name} ({submission.author_email})</p>
                        <p><strong>Submitted:</strong> {formatDate(submission.submitted_at)}</p>
                        
                        {submission.reviewed_at && (
                          <p><strong>Reviewed:</strong> {formatDate(submission.reviewed_at)}</p>
                        )}
                        
                        {submission.reviewer_notes && (
                          <p><strong>Notes:</strong> {submission.reviewer_notes}</p>
                        )}
                        
                        {submission.submission_type === 'contact' && (
                          <>
                            <p><strong>Contact Type:</strong> {submission.contact_type}</p>
                            {submission.contact_method && (
                              <p><strong>Contact Method:</strong> {submission.contact_method}</p>
                            )}
                            {submission.contact_method_details && (
                              <p><strong>Contact Details:</strong> {submission.contact_method_details}</p>
                            )}
                            {submission.event_name && (
                              <p><strong>Event/Dungeon:</strong> {submission.event_name}</p>
                            )}
                          </>
                        )}
                        
                        {submission.submission_type === 'article' && (
                          <>
                            <p><strong>Category:</strong> {submission.article_category}</p>
                            <p><strong>Word Count:</strong> {submission.word_count}</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      Click to view full content
                    </div>
                  </div>
                  
                  <div className="border-t border-dark-600 pt-4">
                    <h4 className="text-white font-medium mb-2">Content Preview:</h4>
                    <div className="bg-dark-700 rounded p-3 text-gray-300 text-sm max-h-32 overflow-y-auto">
                      {submission.submission_type === 'article' 
                        ? submission.article_excerpt
                        : submission.article_content
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Moderation Log Tab */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          {moderationLogs.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="text-lg font-medium mb-2">No moderation actions found.</div>
              <div className="text-sm">No articles have been edited or deleted yet.</div>
            </div>
          ) : (
            <div className="grid gap-6">
              {moderationLogs.map((log) => (
                <div key={log.id} className="bg-dark-800 rounded-lg p-6 border border-dark-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.action === 'edit' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {log.action === 'edit' ? 'Edited' : 'Deleted'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">{log.article_title}</h3>
                      
                      <div className="text-gray-300 text-sm space-y-1">
                        <p><strong>Admin:</strong> {log.admin_name}</p>
                        <p><strong>Date:</strong> {formatDate(log.timestamp)}</p>
                        {log.notes && (
                          <p><strong>Notes:</strong> {log.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for detailed view */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[var(--z-ecke-modal)]">
          <div className="bg-dark-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Review Submission
                </h2>
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
                    <h3 className="text-lg font-semibold text-white mb-3">Submission Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedSubmission.submission_type === 'article' 
                            ? 'bg-blue-500 text-white' 
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
                      
                      {selectedSubmission.reviewed_at && (
                        <p><strong className="text-white">Reviewed:</strong> {formatDate(selectedSubmission.reviewed_at)}</p>
                      )}
                      
                      {selectedSubmission.reviewer_notes && (
                        <p><strong className="text-white">Notes:</strong> {selectedSubmission.reviewer_notes}</p>
                      )}
                      
                      {selectedSubmission.submission_type === 'contact' && (
                        <>
                          <p><strong className="text-white">Contact Type:</strong> {selectedSubmission.contact_type}</p>
                          {selectedSubmission.contact_method && (
                            <p><strong className="text-white">Contact Method:</strong> {selectedSubmission.contact_method}</p>
                          )}
                          {selectedSubmission.contact_method_details && (
                            <p><strong className="text-white">Contact Details:</strong> {selectedSubmission.contact_method_details}</p>
                          )}
                          {selectedSubmission.event_name && (
                            <p><strong className="text-white">Event/Dungeon:</strong> {selectedSubmission.event_name}</p>
                          )}
                          {selectedSubmission.event_date && (
                            <p><strong className="text-white">Event Date:</strong> {selectedSubmission.event_date}</p>
                          )}
                          {selectedSubmission.event_location && (
                            <p><strong className="text-white">Event Location:</strong> {selectedSubmission.event_location}</p>
                          )}
                          {selectedSubmission.event_website && (
                            <p><strong className="text-white">Event Website:</strong> <a href={selectedSubmission.event_website} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">{selectedSubmission.event_website}</a></p>
                          )}
                          {selectedSubmission.dungeon_name && (
                            <p><strong className="text-white">Dungeon Name:</strong> {selectedSubmission.dungeon_name}</p>
                          )}
                          {selectedSubmission.dungeon_location && (
                            <p><strong className="text-white">Dungeon Location:</strong> {selectedSubmission.dungeon_location}</p>
                          )}
                          {selectedSubmission.dungeon_website && (
                            <p><strong className="text-white">Dungeon Website:</strong> <a href={selectedSubmission.dungeon_website} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">{selectedSubmission.dungeon_website}</a></p>
                          )}
                        </>
                      )}
                      
                      {selectedSubmission.submission_type === 'article' && (
                        <>
                          <p><strong className="text-white">Category:</strong> {selectedSubmission.article_category}</p>
                          <p><strong className="text-white">Word Count:</strong> {selectedSubmission.word_count}</p>
                          <p><strong className="text-white">Author Bio:</strong> {selectedSubmission.author_bio}</p>
                          {selectedSubmission.author_credentials && (
                            <p><strong className="text-white">Credentials:</strong> {selectedSubmission.author_credentials}</p>
                          )}
                          {selectedSubmission.article_tags && (
                            <p><strong className="text-white">Tags:</strong> {selectedSubmission.article_tags}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Full Content</h3>
                    <div className="bg-dark-800 rounded p-4 text-gray-300 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {selectedSubmission.submission_type === 'article' 
                        ? selectedSubmission.article_content
                        : selectedSubmission.article_content
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-4 mt-6 pt-6 border-t border-dark-600">
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
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
