'use client'

import { useEditor, useEditorState, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link,
  ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content,
    editorProps: {
      /* StarterKit above allows only h2/h3 (the post page supplies the
         single h1 itself). ProseMirror doesn't warn when pasted content
         falls outside the schema — it silently downgrades it — so an
         h1 or an h4 came through as a plain paragraph and the document's
         whole heading structure was lost on paste, which is exactly what
         made pasted articles arrive as one flat wall of text.

         Remapping into the allowed range keeps the structure rather than
         discarding it: h1 becomes the top in-content level, and h4-h6
         collapse to h3 (the deepest level this editor offers). Parsed
         via DOMParser rather than regex so attributes and nesting can't
         be mangled by a greedy match. Lists, bold and links already
         survived paste and are deliberately untouched. */
      transformPastedHTML(html: string) {
        if (typeof window === 'undefined') return html
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const remap = (selector: string, tag: string) => {
          doc.querySelectorAll(selector).forEach((el) => {
            const replacement = doc.createElement(tag)
            replacement.innerHTML = el.innerHTML
            el.replaceWith(replacement)
          })
        }
        remap('h1', 'h2')
        remap('h4, h5, h6', 'h3')
        return doc.body.innerHTML
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
  })

  /* TipTap v3 stopped re-rendering the host component on every editor
     transaction (selection changes included) — a deliberate performance
     change from v2, where that used to happen automatically. The
     TOOLBAR_BUTTONS array below used to call editor.isActive(...)
     directly in the render body, which read the state as of whichever
     render last happened to run — typing (which fires onUpdate -> the
     parent's onChange -> a re-render here) kept it looking plausible,
     but simply clicking into a different block without editing text
     never re-rendered this component at all, so every highlight was
     reading stale state. Confirmed directly: after toggling a bullet
     list, editor.getHTML() showed <ul><li>...</li></ul> — the actual
     document was correct — while the Bullet list button still read
     inactive.

     useEditorState is TipTap's own fix for this: it subscribes to
     transactions and recomputes only this selector, so the toolbar
     re-renders reactively without forcing the whole editor tree to
     re-render on every keystroke the way a blunt "re-render on every
     transaction" setting would. */
  const activeStates = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold:        e?.isActive('bold') ?? false,
      italic:      e?.isActive('italic') ?? false,
      heading2:    e?.isActive('heading', { level: 2 }) ?? false,
      heading3:    e?.isActive('heading', { level: 3 }) ?? false,
      bulletList:  e?.isActive('bulletList') ?? false,
      orderedList: e?.isActive('orderedList') ?? false,
      blockquote:  e?.isActive('blockquote') ?? false,
      codeBlock:   e?.isActive('codeBlock') ?? false,
      link:        e?.isActive('link') ?? false,
    }),
  })

  if (!editor) return null

  function handleLink() {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  function handleImage() {
    if (!editor) return
    const url = window.prompt('Enter image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const TOOLBAR_BUTTONS = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      active: activeStates?.bold ?? false,
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      active: activeStates?.italic ?? false,
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: activeStates?.heading2 ?? false,
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: activeStates?.heading3 ?? false,
    },
    {
      icon: List,
      label: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: activeStates?.bulletList ?? false,
    },
    {
      icon: ListOrdered,
      label: 'Ordered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: activeStates?.orderedList ?? false,
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: activeStates?.blockquote ?? false,
    },
    {
      icon: Code2,
      label: 'Code block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: activeStates?.codeBlock ?? false,
    },
    {
      icon: Link,
      label: 'Link',
      action: handleLink,
      active: activeStates?.link ?? false,
    },
    {
      icon: ImageIcon,
      label: 'Image',
      action: handleImage,
      active: false,
    },
  ]

  return (
    <div className="overflow-hidden rounded-md border border-neutral-300">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            title={btn.label}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded text-sm transition-colors hover:bg-neutral-200',
              btn.active && 'bg-neutral-200 text-neutral-900'
            )}
          >
            <btn.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm max-w-none px-4 py-3',
          '[&_.tiptap]:min-h-[300px] [&_.tiptap]:outline-none',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:text-neutral-400 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:h-0'
        )}
      />
    </div>
  )
}
