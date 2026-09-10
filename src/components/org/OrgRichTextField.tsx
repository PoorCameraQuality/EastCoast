'use client'

import { useEffect, useRef } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { orgCopyLooksLikeMarkdown, orgCopyToEditorHtml, orgPlainTextToHtml } from '@/lib/eckeOrgRichText'

type Props = {
  name?: string
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
}

type Tool = {
  label: string
  title: string
  run: () => void
  active?: boolean
}

export default function OrgRichTextField({
  name,
  value,
  onChange,
  id = 'org-rich-text',
  placeholder = 'Describe the gathering. Paste from a doc or use the toolbar.',
}: Props) {
  const editorRef = useRef<Editor | null>(null)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'org-rich-text-image',
        },
      }),
    ],
    content: orgCopyToEditorHtml(value),
    immediatelyRender: false,
    onCreate: ({ editor: next }) => {
      editorRef.current = next
    },
    onUpdate: ({ editor: next }) => {
      onChange(next.getHTML())
    },
    editorProps: {
      attributes: {
        id,
        class: 'org-rich-text-editor',
        'aria-label': 'Listing description',
      },
      handlePaste(_view, event) {
        const html = event.clipboardData?.getData('text/html') || ''
        const text = event.clipboardData?.getData('text/plain') || ''
        if (!text || html.includes('<h2') || html.includes('<p')) return false
        if (!orgCopyLooksLikeMarkdown(text) && !text.includes('**')) return false
        const converted = orgPlainTextToHtml(text)
        if (!converted) return false
        editorRef.current?.chain().focus().insertContent(converted).run()
        return true
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = orgCopyToEditorHtml(value)
    if (next && editor.isEmpty) editor.commands.setContent(next, false)
  }, [editor, value])

  if (!editor) {
    return <div className="org-rich-text org-rich-text-loading">Loading editor…</div>
  }

  const currentEditor = editor

  function setLink() {
    if (currentEditor.isActive('link')) {
      currentEditor.chain().focus().unsetLink().run()
      return
    }
    const href = window.prompt('Link URL')
    if (href) currentEditor.chain().focus().setLink({ href }).run()
  }

  function addImage() {
    const src = window.prompt('Image URL')
    if (src) currentEditor.chain().focus().setImage({ src }).run()
  }

  const tools: Tool[] = [
    { label: 'Bold', title: 'Bold', run: () => currentEditor.chain().focus().toggleBold().run(), active: currentEditor.isActive('bold') },
    { label: 'Italic', title: 'Italic', run: () => currentEditor.chain().focus().toggleItalic().run(), active: currentEditor.isActive('italic') },
    { label: 'H2', title: 'Heading', run: () => currentEditor.chain().focus().toggleHeading({ level: 2 }).run(), active: currentEditor.isActive('heading', { level: 2 }) },
    { label: 'H3', title: 'Subheading', run: () => currentEditor.chain().focus().toggleHeading({ level: 3 }).run(), active: currentEditor.isActive('heading', { level: 3 }) },
    { label: 'List', title: 'Bullet list', run: () => currentEditor.chain().focus().toggleBulletList().run(), active: currentEditor.isActive('bulletList') },
    { label: 'Numbers', title: 'Numbered list', run: () => currentEditor.chain().focus().toggleOrderedList().run(), active: currentEditor.isActive('orderedList') },
    { label: 'Quote', title: 'Quote', run: () => currentEditor.chain().focus().toggleBlockquote().run(), active: currentEditor.isActive('blockquote') },
    { label: 'Line', title: 'Divider', run: () => currentEditor.chain().focus().setHorizontalRule().run() },
    { label: 'Link', title: currentEditor.isActive('link') ? 'Remove link' : 'Add link', run: setLink, active: currentEditor.isActive('link') },
    { label: 'Image', title: 'Add image by URL', run: addImage },
    { label: 'Clear', title: 'Clear formatting', run: () => currentEditor.chain().focus().clearNodes().unsetAllMarks().run() },
  ]

  return (
    <div className="org-rich-text">
      <div className="org-rich-text-toolbar" role="toolbar" aria-label="Text formatting">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.title}
            aria-pressed={tool.active || false}
            className={`org-rich-text-tool${tool.active ? ' is-active' : ''}`}
            onClick={tool.run}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div className="org-rich-text-surface">
        <EditorContent editor={editor} />
      </div>
      <textarea name={name} value={value} readOnly hidden />
      <p className="org-rich-text-hint">
        {placeholder} Headings, lists, quotes, links, and images save as HTML with your listing.
      </p>
    </div>
  )
}
