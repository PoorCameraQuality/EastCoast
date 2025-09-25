import { supabase } from '@/lib/supabase'
import { markdownToHtml, stripFirstH1 } from '@/lib/markdown'

export default async function TestArticle() {
  try {
    const client = supabase
    if (!client) {
      return <div>Supabase not configured</div>
    }

    const { data: article, error } = await client
      .from('articles')
      .select('*')
      .eq('slug', 'understanding-drop-kink-sub-top-event')
      .eq('status', 'published')
      .single()

    if (error || !article) {
      return <div>Article not found: {error?.message}</div>
    }

    // Check if content is HTML or markdown and process accordingly
    let contentHtml: string
    let contentFormat: string
    
    if (article.content.includes('<p>') || article.content.includes('<h1>') || article.content.includes('<div>') || article.content.includes('<br>')) {
      // Content is already HTML, use it directly
      contentHtml = article.content
      contentFormat = 'HTML'
    } else if (article.content.includes('# ') || article.content.includes('## ') || article.content.includes('**') || article.content.includes('*')) {
      // Content is markdown, process it
      const processedContent = stripFirstH1(article.content)
      contentHtml = await markdownToHtml(processedContent)
      contentFormat = 'Markdown'
    } else {
      // Fallback: treat as plain text
      contentHtml = `<div class="prose">${article.content.replace(/\n/g, '<br>')}</div>`
      contentFormat = 'Plain Text'
    }

    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Article Content Test</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Article Info:</h2>
            <div className="bg-gray-800 p-4 rounded text-white">
              <p><strong>Title:</strong> {article.title}</p>
              <p><strong>Content Format:</strong> {contentFormat}</p>
              <p><strong>Content Length:</strong> {article.content.length} characters</p>
              <p><strong>HTML Length:</strong> {contentHtml.length} characters</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Raw Content (first 500 chars):</h2>
            <pre className="bg-gray-800 p-4 rounded text-green-400 text-sm overflow-x-auto">
              {article.content.substring(0, 500)}...
            </pre>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Processed HTML (first 500 chars):</h2>
            <pre className="bg-gray-800 p-4 rounded text-blue-400 text-sm overflow-x-auto">
              {contentHtml.substring(0, 500)}...
            </pre>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Rendered Content:</h2>
            <div className="bg-gray-800 p-4 rounded">
              <div 
                className="prose prose-neutral dark:prose-invert prose-headings:scroll-mt-20 prose-li:marker:text-muted-foreground prose-img:rounded-xl prose-pre:rounded-xl prose-strong:text-white prose-strong:font-semibold prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-p:text-gray-300 prose-li:text-gray-300 prose-ul:text-gray-300 prose-ol:text-gray-300 leading-relaxed max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml }} 
              />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <pre className="bg-red-900 p-4 rounded text-red-400 text-sm">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    )
  }
}
