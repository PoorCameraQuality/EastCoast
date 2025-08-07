'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { isAdmin, getCurrentUser } from '@/lib/auth'
import RichTextEditor from '@/components/education/RichTextEditor'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  author_name: string
  author_credentials?: string
  author_bio?: string
  category: string
  tags?: string[]
  featured: boolean
  status: string
  created_at: string
  read_time?: string
}

interface ModerationLog {
  id: string
  action: string
  article_title: string
  article_id: string
  admin_name: string
  timestamp: string
  notes?: string
}

export default function ArticleManagementPanel() {
  const [articles, setArticles] = useState<Article[]>([])
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'articles' | 'moderation'>('articles')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author_name: '',
    author_credentials: '',
    author_bio: '',
    category: '',
    tags: '',
    featured: false,
    notes: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin()
      const user = await getCurrentUser()
      setIsAdminUser(adminStatus)
      setCurrentUser(user)
    }
    
    checkAdminStatus()
    fetchArticles()
    fetchModerationLogs()
  }, [])

  const fetchArticles = async () => {
    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching articles:', error)
        return
      }

      setArticles(articles || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchModerationLogs = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('moderation_logs')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching moderation logs:', error)
        return
      }

      setModerationLogs(logs || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = (article: Article) => {
    setSelectedArticle(article)
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
    setIsEditing(true)
  }

  const handleDelete = async (article: Article) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
      return
    }

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
          notes: 'Article deleted by admin'
        }])

      if (logError) {
        console.error('Error logging deletion:', logError)
      }

      // Refresh data
      fetchArticles()
      fetchModerationLogs()
      alert('Article deleted successfully')
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting article')
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedArticle) return

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
        .eq('id', selectedArticle.id)

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
          article_id: selectedArticle.id,
          admin_name: currentUser?.name || currentUser?.email || 'Admin',
          notes: editForm.notes || 'Article edited by admin'
        }])

      if (logError) {
        console.error('Error logging edit:', logError)
      }

      // Refresh data
      await fetchArticles()
      await fetchModerationLogs()
      
      // Show success message
      setSaveStatus('success')
      setSaveMessage('Article updated successfully!')
      
      // Reset form after a delay
      setTimeout(() => {
        setIsEditing(false)
        setSelectedArticle(null)
        setSaveStatus('idle')
        setSaveMessage('')
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
    setSelectedArticle(null)
  }

  // Check if user is admin
  if (!isAdminUser) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-xl mb-4">🔒 Access Denied</div>
        <div className="text-gray-400">You must be logged in as an administrator to access this page.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 text-center">Manage Articles</h1>
        <p className="text-lg text-subtle max-w-3xl mb-8 text-center mx-auto">Edit and delete published articles with full moderation logging.</p>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Articles ({articles.length})
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

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <div>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-subtle">No published articles found.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {articles.map((article) => (
                <div key={article.id} className="bg-dark-800 rounded-lg p-6 border border-dark-600">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{article.title}</h3>
                      <p className="text-subtle mb-2">{article.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>By: {article.author_name}</span>
                        <span>Category: {article.category}</span>
                        <span>Published: {new Date(article.created_at).toLocaleDateString()}</span>
                        {article.featured && (
                          <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded">Featured</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Moderation Log Tab */}
      {activeTab === 'moderation' && (
        <div>
          {moderationLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-subtle">No moderation logs found.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {moderationLogs.map((log) => (
                <div key={log.id} className="bg-dark-800 rounded-lg p-4 border border-dark-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.action === 'delete' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {log.action.toUpperCase()}
                        </span>
                        <span className="text-white font-medium">{log.article_title}</span>
                      </div>
                      <p className="text-sm text-gray-400">Admin: {log.admin_name}</p>
                      {log.notes && <p className="text-sm text-subtle mt-1">{log.notes}</p>}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Article</h2>
            
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
                saveStatus === 'saving' ? 'bg-blue-600 text-white' :
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
      )}
    </div>
  )
}
