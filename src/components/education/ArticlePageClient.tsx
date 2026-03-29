'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isAdmin, getCurrentUser } from '@/lib/auth'
import RichTextEditor from '@/components/education/RichTextEditor'
import TableOfContents from '@/components/TableOfContents'
import ReadingProgress from '@/components/ReadingProgress'
import BackToTop from '@/components/BackToTop'
import { ArticleStructuredData } from '@/components/ArticleStructuredData'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author_name: string
  author_credentials?: string
  author_bio?: string
  category: string
  tags?: string[] | string
  focus_keywords?: string[] | string
  og_image?: string | null
  featured: boolean
  status: string
  created_at: string
  publish_date?: string
  last_updated?: string
  read_time?: string
}

interface ArticlePageClientProps {
  article: Article
  breadcrumbItems: Array<{ label: string; href?: string; current?: boolean }>
}

export default function ArticlePageClient({ article, breadcrumbItems }: ArticlePageClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [editForm, setEditForm] = useState({
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    author_name: article.author_name,
    author_credentials: article.author_credentials || '',
    author_bio: article.author_bio || '',
    category: article.category,
    tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '',
    featured: article.featured,
    notes: ''
  })

  // Check admin status on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin()
      const user = await getCurrentUser()
      setIsAdminUser(adminStatus)
      setCurrentUser(user)
    }
    
    checkAdminStatus()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently published'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
      return
    }

    // Check if Supabase is configured
    if (!supabase) {
      alert('Database is not configured')
      return
    }

    setIsDeleting(true)

    try {
      // Delete the article
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', article.id)

      if (deleteError) {
        console.error('Error deleting article:', deleteError)
        alert('Error deleting article')
        return
      }

             // Log the deletion
       const { error: logError } = await supabase
         .from('moderation_logs')
         .insert([{
           action: 'delete',
           article_title: article.title,
           article_id: article.id,
           admin_name: currentUser?.name || currentUser?.email || 'Admin',
           notes: 'Article deleted from individual page'
         }])

      if (logError) {
        console.error('Error logging deletion:', logError)
      }

      alert('Article deleted successfully')
      router.push('/education')
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting article')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveEdit = async () => {
    // Check if Supabase is configured
    if (!supabase) {
      setSaveStatus('error')
      setSaveMessage('Database is not configured')
      setTimeout(() => {
        setSaveStatus('idle')
        setSaveMessage('')
      }, 3000)
      return
    }

    // Set saving state
    setIsSaving(true)
    setSaveStatus('saving')
    setSaveMessage('Saving changes...')

    try {
      // Update the article
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title: editForm.title,
          excerpt: editForm.excerpt,
          content: editForm.content,
          author_name: editForm.author_name,
          author_credentials: editForm.author_credentials,
          author_bio: editForm.author_bio,
          category: editForm.category,
          tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          featured: editForm.featured
        })
        .eq('id', article.id)

      if (updateError) {
        console.error('Error updating article:', updateError)
        setSaveStatus('error')
        setSaveMessage('Error updating article')
        setTimeout(() => {
          setSaveStatus('idle')
          setSaveMessage('')
        }, 3000)
        return
      }

      // Log the edit
      const { error: logError } = await supabase
        .from('moderation_logs')
        .insert([{
          action: 'edit',
          article_title: editForm.title,
          article_id: article.id,
          admin_name: currentUser?.name || currentUser?.email || 'Admin',
          notes: editForm.notes || 'Article edited from individual page'
        }])

      if (logError) {
        console.error('Error logging edit:', logError)
      }

      // Show success message
      setSaveStatus('success')
      setSaveMessage('Article updated successfully!')
      
      // Refresh the page after a delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Error:', error)
      setSaveStatus('error')
      setSaveMessage('Error updating article')
      setTimeout(() => {
        setSaveStatus('idle')
        setSaveMessage('')
      }, 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author_name: article.author_name,
      author_credentials: article.author_credentials || '',
      author_bio: article.author_bio || '',
      category: article.category,
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '',
      featured: article.featured,
      notes: ''
    })
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-custom py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Edit Article</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Category *</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Safety">Safety</option>
                  <option value="Techniques">Techniques</option>
                  <option value="Community">Community</option>
                  <option value="Resources">Resources</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">Excerpt *</label>
              <textarea
                value={editForm.excerpt}
                onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Author Name *</label>
                <input
                  type="text"
                  value={editForm.author_name}
                  onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Author Credentials</label>
                <input
                  type="text"
                  value={editForm.author_credentials}
                  onChange={(e) => setEditForm({ ...editForm, author_credentials: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">Author Bio</label>
              <textarea
                value={editForm.author_bio}
                onChange={(e) => setEditForm({ ...editForm, author_bio: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
              />
            </div>

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="safety, consent, negotiation"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.featured}
                  onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-white text-sm">Featured Article</span>
              </label>
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">Content *</label>
              <RichTextEditor
                content={editForm.content}
                onChange={(content) => setEditForm({ ...editForm, content })}
                placeholder="Edit article content..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">Moderation Notes</label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="Optional notes about this edit..."
              />
            </div>

            {/* Status Message */}
            {saveMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                saveStatus === 'saving' ? 'bg-primary-600 text-white' :
                saveStatus === 'success' ? 'bg-green-600 text-white' :
                saveStatus === 'error' ? 'bg-red-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                <div className="flex items-center">
                  {saveStatus === 'saving' && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {saveStatus === 'success' && (
                    <svg className="mr-3 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {saveStatus === 'error' && (
                    <svg className="mr-3 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{saveMessage}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className={`px-6 py-2 rounded transition-colors flex items-center ${
                  isSaving 
                    ? 'bg-gray-500 text-white cursor-not-allowed' 
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <ArticleStructuredData article={article} />
      <ReadingProgress />
      
      <div className="container-custom py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                  {article.category}
                </span>
                {article.featured && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-black">
                    Featured
                  </span>
                )}
              </div>
              
                             {/* Admin Actions - Only visible to admins */}
               {isAdminUser && (
                 <div className="flex gap-2">
                   <button
                     onClick={handleEdit}
                     className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-sm"
                   >
                     Edit Article
                   </button>
                   <button
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                   >
                     {isDeleting ? 'Deleting...' : 'Delete Article'}
                   </button>
                 </div>
               )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between text-gray-300 mb-8">
              <div className="flex items-center gap-4">
                <span className="font-medium">{article.author_name}</span>
                {article.author_credentials && (
                  <span className="text-sm">• {article.author_credentials}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                {article.read_time && (
                  <span>{article.read_time}</span>
                )}
                <span>{formatDate(article.created_at)}</span>
              </div>
            </div>
            
            {article.excerpt && (
              <p className="text-lg text-subtle leading-relaxed mb-8">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Article Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="prose prose-invert prose-lg max-w-none">
                <div 
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <TableOfContents content={article.content} />
              </div>
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t border-dark-600">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>
                <p><strong>Author:</strong> {article.author_name}</p>
                {article.author_bio && (
                  <p className="mt-2 text-gray-300">{article.author_bio}</p>
                )}
              </div>
              <div className="text-right">
                <p><strong>Published:</strong> {formatDate(article.created_at)}</p>
                {(() => {
                  const raw = article.tags
                  const tagList = raw
                    ? Array.isArray(raw)
                      ? raw
                      : raw.split(',').map((t) => t.trim()).filter(Boolean)
                    : []
                  if (tagList.length === 0) return null
                  return (
                  <div className="mt-2">
                    <p><strong>Tags:</strong></p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tagList.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs bg-dark-700 text-gray-300"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BackToTop />
    </div>
  )
}
