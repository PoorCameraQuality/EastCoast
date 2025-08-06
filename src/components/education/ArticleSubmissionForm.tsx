'use client'

import { useState } from 'react'
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'

interface SubmissionFormData {
  authorName: string
  authorEmail: string
  authorCredentials: string
  authorBio: string
  articleTitle: string
  articleExcerpt: string
  articleContent: string
  articleCategory: string
  articleTags: string
  contactMethod: string
  agreeToTerms: boolean
}

export default function ArticleSubmissionForm() {
  const { trackEvent } = useGoogleAnalytics()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formData, setFormData] = useState<SubmissionFormData>({
    authorName: '',
    authorEmail: '',
    authorCredentials: '',
    authorBio: '',
    articleTitle: '',
    articleExcerpt: '',
    articleContent: '',
    articleCategory: '',
    articleTags: '',
    contactMethod: '',
    agreeToTerms: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Track form submission
    trackEvent('submit', 'article_submission', formData.articleCategory, 1)
    
    try {
      const response = await fetch('/api/education/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        setFormData({
          authorName: '',
          authorEmail: '',
          authorCredentials: '',
          authorBio: '',
          articleTitle: '',
          articleExcerpt: '',
          articleContent: '',
          articleCategory: '',
          articleTags: '',
          contactMethod: '',
          agreeToTerms: false
        })
      } else {
        alert('There was an error submitting your article. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting article:', error)
      alert('There was an error submitting your article. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const wordCount = formData.articleContent.split(/\s+/).filter(word => word.length > 0).length

  if (submitSuccess) {
    return (
      <div className="card-elegant text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-serif font-semibold text-white mb-4">
            Article Submitted Successfully!
          </h2>
          <p className="text-lg text-subtle mb-6">
            Thank you for your submission. We'll review your article and get back to you within 7-10 business days.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="btn-primary"
          >
            Submit Another Article
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-elegant">
      <h2 className="text-2xl font-serif font-semibold text-white mb-6">
        Article Submission Form
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Author Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Author Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Author Name *
              </label>
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="authorEmail"
                value={formData.authorEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Credentials/Qualifications
            </label>
            <input
              type="text"
              name="authorCredentials"
              value={formData.authorCredentials}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., BDSM Educator, Therapist, Community Leader"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Author Bio *
            </label>
            <textarea
              name="authorBio"
              value={formData.authorBio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Brief description of your experience and expertise..."
              required
            />
          </div>
        </div>

        {/* Article Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Article Information</h3>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Article Title *
            </label>
            <input
              type="text"
              name="articleTitle"
              value={formData.articleTitle}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your article title..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Category *
              </label>
              <select
                name="articleCategory"
                value={formData.articleCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                <option value="Safety">Safety</option>
                <option value="Techniques">Techniques</option>
                <option value="Community">Community</option>
                <option value="Resources">Resources</option>
              </select>
            </div>
            
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
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Article Excerpt *
            </label>
            <textarea
              name="articleExcerpt"
              value={formData.articleExcerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Brief summary of your article (2-3 sentences)..."
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="articleTags"
              value={formData.articleTags}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., safety, consent, beginners, negotiation"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Article Content *
            </label>
            <div className="mb-2">
              <span className="text-xs text-subtle">
                Word count: {wordCount} (Minimum: 500, Maximum: 3000)
              </span>
            </div>
            <textarea
              name="articleContent"
              value={formData.articleContent}
              onChange={handleInputChange}
              rows={15}
              className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Write your article content here. You can use markdown formatting for headers, bold text, lists, etc..."
              required
            />
            <div className="mt-2 text-xs text-subtle">
              <p>You can use basic markdown formatting:</p>
              <p>**bold text** for <strong>bold text</strong></p>
              <p>*italic text* for <em>italic text</em></p>
              <p># Header 1, ## Header 2, ### Header 3</p>
              <p>- List items with dashes</p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1 mr-3"
              required
            />
            <label className="text-sm text-subtle">
              I agree to the submission terms and conditions. I understand that my article will be reviewed before publication and may be edited for clarity, safety, and community guidelines. I confirm that the content is original and appropriate for educational purposes.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || wordCount < 500 || wordCount > 3000}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Article for Review'}
          </button>
          
          {wordCount < 500 && (
            <p className="text-red-400 text-sm mt-2">
              Article must be at least 500 words
            </p>
          )}
          
          {wordCount > 3000 && (
            <p className="text-red-400 text-sm mt-2">
              Article must be no more than 3000 words
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
