import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Code, Undo, Redo } from 'lucide-react';

// Setup Turndown for HTML -> Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

interface RichTextEditorProps {
  content: string; // Markdown content
  onChange: (markdown: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      icon: <Bold size={18} />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold'
    },
    {
      icon: <Italic size={18} />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic'
    },
    {
      icon: <Heading1 size={18} />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Heading 1'
    },
    {
      icon: <Heading2 size={18} />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Heading 2'
    },
    {
      icon: <List size={18} />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Bullet List'
    },
    {
      icon: <ListOrdered size={18} />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Ordered List'
    },
    {
      icon: <Quote size={18} />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Blockquote'
    },
    {
      icon: <Code size={18} />,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      title: 'Code Block'
    }
  ];

  return (
    <div className="border-b border-[var(--border-color)] p-2 flex flex-wrap gap-1 bg-[var(--bg-surface)] sticky top-0 z-10">
      {buttons.map((btn, index) => (
        <button
          key={index}
          type="button"
          onClick={btn.action}
          className={`p-2 rounded hover:bg-[var(--bg-app)] transition-colors ${
            btn.isActive 
              ? 'text-[var(--accent-primary)] bg-indigo-50 dark:bg-indigo-900/30' 
              : 'text-[var(--text-secondary)]'
          }`}
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
      <div className="w-px h-6 bg-[var(--border-color)] mx-2 self-center"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-[var(--bg-app)] text-[var(--text-secondary)] disabled:opacity-30 transition-colors"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-[var(--bg-app)] text-[var(--text-secondary)] disabled:opacity-30 transition-colors"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your amazing story...',
      }),
    ],
    editorProps: {
      attributes: {
        // Explicitly set text color to primary for all prose elements to prevent "faded" look
        class: `
          prose dark:prose-invert max-w-none p-6 focus:outline-none min-h-[50vh]
          text-[var(--text-primary)]
          prose-p:text-[var(--text-primary)]
          prose-headings:text-[var(--text-primary)]
          prose-strong:text-[var(--text-primary)]
          prose-li:text-[var(--text-primary)]
          prose-blockquote:text-[var(--text-primary)]
        `.replace(/\s+/g, ' '),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Convert HTML back to markdown for storage
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  // Sync content updates (e.g. from AI)
  // We check if the content is different to avoid cursor jumps / loops
  useEffect(() => {
    if (editor && content) {
      const currentHTML = editor.getHTML();
      // Convert editor HTML to markdown to compare with prop
      const currentMarkdown = turndownService.turndown(currentHTML);
      
      // Basic check to see if content substantially changed externally
      // This helps when AI completely rewrites or appends content
      if (currentMarkdown.trim() !== content.trim()) {
        // Only update if not focused to avoid disrupting typing, 
        // OR if the length difference is significant (AI update)
        // This is a heuristic.
        if (!editor.isFocused || Math.abs(currentMarkdown.length - content.length) > 5) {
             // Parse markdown to HTML for TipTap
             const html = marked.parse(content) as string;
             editor.commands.setContent(html);
        }
      }
    }
  }, [content, editor]);

  // Initial load
  useEffect(() => {
    if (editor && content && editor.isEmpty) {
        const html = marked.parse(content) as string;
        editor.commands.setContent(html);
    }
  }, [editor]); // Only run when editor becomes available

  return (
    <div className="flex flex-col h-full bg-[var(--editor-bg)]">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto custom-scrollbar cursor-text" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;