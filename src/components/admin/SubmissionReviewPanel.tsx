'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Submission {
  id: string
  author_name: string
  author_email: string
  author_credentials: string
  author_bio: string
  article_title: string
  article_excerpt: string
  article_content: string
  article_category: string
  article_tags: string
  contact_method: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewer_notes?: string
  word_count: number
}

export default function SubmissionReviewPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  // Fetch submissions from Supabase
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
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
        console.error('Error fetching submissions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  const filteredSubmissions = submissions.filter(sub => 
    filter === 'all' ? true : sub.status === filter
  )

  const handleApprove = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerNotes: 'Approved for publication' })
      })

      if (response.ok) {
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: 'approved' as const, reviewed_at: new Date().toISOString() }
            : sub
        ))
        setSelectedSubmission(null)
      }
    } catch (error) {
      console.error('Error approving submission:', error)
    }
  }

  const handleReject = async (submissionId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerNotes: reason })
      })

      if (response.ok) {
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: 'rejected' as const, reviewed_at: new Date().toISOString() }
            : sub
        ))
        setSelectedSubmission(null)
      }
    } catch (error) {
      console.error('Error rejecting submission:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="card-elegant text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
        <p className="text-subtle">Loading submissions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' 
              ? 'bg-primary-500 text-white' 
              : 'bg-dark-700 text-subtle hover:bg-dark-600'
          }`}
        >
          All ({submissions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'pending' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-dark-700 text-subtle hover:bg-dark-600'
          }`}
        >
          Pending ({submissions.filter(s => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'approved' 
              ? 'bg-green-500 text-white' 
              : 'bg-dark-700 text-subtle hover:bg-dark-600'
          }`}
        >
          Approved ({submissions.filter(s => s.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'rejected' 
              ? 'bg-red-500 text-white' 
              : 'bg-dark-700 text-subtle hover:bg-dark-600'
          }`}
        >
          Rejected ({submissions.filter(s => s.status === 'rejected').length})
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="card-elegant text-center">
            <p className="text-subtle">No submissions found.</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div key={submission.id} className="card-elegant">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {submission.article_title}
                  </h3>
                  <p className="text-sm text-subtle">
                    by {submission.author_name} • {submission.article_category} • {formatDate(submission.submitted_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    submission.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
                    submission.status === 'approved' ? 'bg-green-500 text-green-900' :
                    'bg-red-500 text-red-900'
                  }`}>
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
              
              <p className="text-subtle mb-4">{submission.article_excerpt}</p>
              
              <div className="flex flex-wrap gap-2">
                {submission.article_tags.split(',').map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-semibold text-white">
                  Review Submission
                </h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-subtle hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Submission Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Article Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-white">Title:</strong> {selectedSubmission.article_title}</p>
                      <p><strong className="text-white">Category:</strong> {selectedSubmission.article_category}</p>
                      <p><strong className="text-white">Submitted:</strong> {formatDate(selectedSubmission.submitted_at)}</p>
                      <p><strong className="text-white">Word Count:</strong> {selectedSubmission.word_count}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Author Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-white">Name:</strong> {selectedSubmission.author_name}</p>
                      <p><strong className="text-white">Email:</strong> {selectedSubmission.author_email}</p>
                      <p><strong className="text-white">Credentials:</strong> {selectedSubmission.author_credentials}</p>
                      <p><strong className="text-white">Bio:</strong> {selectedSubmission.author_bio}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Article Excerpt</h3>
                    <p className="text-sm text-subtle">{selectedSubmission.article_excerpt}</p>
                  </div>
                </div>

                {/* Article Content */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Article Content</h3>
                  <div className="bg-dark-700 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm text-subtle whitespace-pre-wrap">
                      {selectedSubmission.article_content}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-4 mt-6 pt-6 border-t border-dark-600">
                  <button
                    onClick={() => handleApprove(selectedSubmission.id)}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission.id, 'Content does not meet our guidelines')}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
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
