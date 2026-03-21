'use client'

import { useState } from 'react'
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'
import RichTextEditor from './RichTextEditor'

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

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      articleContent: content
    }))
  }

  // Calculate word count from HTML content (strip HTML tags)
  const wordCount = formData.articleContent
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .split(' ')
    .filter(word => word.length > 0).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/education/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        trackEvent('submit', 'article_submission', formData.articleCategory, 1)
      } else {
        setError(result.error || 'Failed to submit article')
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
          <h2 className="text-2xl font-serif font-semibold text-white mb-4">
            Article Submitted Successfully!
          </h2>
          <p className="text-lg text-subtle mb-6">
            Thank you for your submission. We'll review your article and get back to you within 7-10 business days.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            type="button"
            className="btn-primary min-h-touch inline-flex items-center justify-center px-6 py-2.5"
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
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Author Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-semibold text-white mb-4 border-b border-dark-600 pb-2">
            Author Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Author Name *
              </label>
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
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
                className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="your.email@example.com"
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
              className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="e.g., BDSM Educator, Therapist, Community Leader, etc."
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
              className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="Brief description of your experience and expertise in the kink community..."
              required
            />
          </div>
        </div>

        {/* Article Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-semibold text-white mb-4 border-b border-dark-600 pb-2">
            Article Information
          </h3>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Article Title *
            </label>
            <input
              type="text"
              name="articleTitle"
              value={formData.articleTitle}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="Enter a compelling title for your article..."
              required
            />
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
              className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="Brief summary of your article (will appear in article previews)..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Article Category *
              </label>
              <select
                name="articleCategory"
                value={formData.articleCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">Select a category</option>
                <option value="Safety">Safety</option>
                <option value="Techniques">Techniques</option>
                <option value="Community">Community</option>
                <option value="Resources">Resources</option>
                <option value="Consent">Consent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Article Tags
              </label>
              <input
                type="text"
                name="articleTags"
                value={formData.articleTags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter tags separated by commas (e.g., consent, negotiation, safety)"
              />
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-semibold text-white mb-4 border-b border-dark-600 pb-2">
            Article Content *
          </h3>
          
          <div>
            <div className="flex justify-between items-center text-sm text-subtle mb-2">
              <span>Use the toolbar above to format your content. You can add images, links, tables, and more.</span>
              <span className={`font-medium ${wordCount < 500 ? 'text-red-400' : 'text-green-400'}`}>
                Word count: {wordCount} (Minimum: 500)
              </span>
            </div>
            <RichTextEditor
              content={formData.articleContent}
              onChange={handleContentChange}
              placeholder="Start writing your article... Use the toolbar above to format your content with headings, bold text, links, images, tables, and more."
            />
          </div>
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
            className="w-full px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="">Select contact method</option>
            <option value="email">Email</option>
            <option value="discord">Discord</option>
            <option value="phone">Phone</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Terms Agreement */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-dark-700"
              required
            />
            <label className="ml-3 text-sm text-subtle">
              I agree to the{' '}
              <a href="/terms" className="text-primary-400 hover:text-primary-300 underline">
                Terms and Conditions
              </a>
              {' '}and confirm that my content follows the community guidelines.
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || wordCount < 500 || !formData.agreeToTerms}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
              isSubmitting || wordCount < 500 || !formData.agreeToTerms
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-500 text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Article'}
          </button>
        </div>
      </form>
    </div>
  )
}
