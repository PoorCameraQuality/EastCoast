import { supabase } from '@/lib/supabase'

export default async function DebugSimple() {
  try {
    const client = supabase
    if (!client) {
      return <div>Supabase not configured</div>
    }

    const { data: article, error } = await client
      .from('articles')
      .select('*')
      .eq('slug', 'sex-positive-kink-inclusive-websites-resources')
      .eq('status', 'published')
      .single()

    if (error || !article) {
      return <div>Article not found: {error?.message}</div>
    }

    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Simple Article Debug</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Article Info:</h2>
            <div className="bg-gray-800 p-4 rounded text-white">
              <p><strong>Title:</strong> {article.title}</p>
              <p><strong>Content Length:</strong> {article.content.length} characters</p>
              <p><strong>Status:</strong> {article.status}</p>
              <p><strong>Category:</strong> {article.category}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Raw Content (first 1000 chars):</h2>
            <div className="bg-gray-800 p-4 rounded text-green-400 text-sm overflow-x-auto">
              <pre>{article.content.substring(0, 1000)}...</pre>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Simple HTML Rendering:</h2>
            <div className="bg-gray-800 p-4 rounded">
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: `<div>${article.content.replace(/\n/g, '<br>')}</div>` 
                }} 
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
