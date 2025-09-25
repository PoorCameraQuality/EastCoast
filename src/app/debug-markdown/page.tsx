import { markdownToHtml, stripFirstH1 } from '@/lib/markdown'

export default async function DebugMarkdown() {
  // Test markdown processing with sample content
  const testMarkdown = `# Test Article

This is a test article with **bold text** and *italic text*.

## Section 1

Here's some content that should be processed.

### Subsection

- List item 1
- List item 2
- List item 3

## Section 2

More content here with [a link](https://example.com).

> This is a blockquote

\`\`\`javascript
console.log('code block')
\`\`\`

## Conclusion

This should be the end of the article.`

  try {
    const processedContent = stripFirstH1(testMarkdown)
    const contentHtml = await markdownToHtml(processedContent)
    
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Markdown Processing Debug</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Original Markdown:</h2>
            <pre className="bg-gray-800 p-4 rounded text-green-400 text-sm overflow-x-auto">
              {testMarkdown}
            </pre>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Processed Content (after stripFirstH1):</h2>
            <pre className="bg-gray-800 p-4 rounded text-blue-400 text-sm overflow-x-auto">
              {processedContent}
            </pre>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Generated HTML:</h2>
            <pre className="bg-gray-800 p-4 rounded text-yellow-400 text-sm overflow-x-auto">
              {contentHtml}
            </pre>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Rendered Output:</h2>
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
          <h1 className="text-2xl font-bold text-white mb-4">Markdown Processing Error</h1>
          <pre className="bg-red-900 p-4 rounded text-red-400 text-sm">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    )
  }
}
