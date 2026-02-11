import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownPreviewProps {
  content: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  // Use useMemo to parse markdown only when content changes
  const html = useMemo(() => {
    if (!content) return '';
    // marked.parse returns a string (or Promise if async is set, which defaults to false)
    return marked.parse(content, { async: false }) as string;
  }, [content]);

  if (!content) {
    return <p className="text-[var(--text-secondary)] italic">Start writing to see the preview...</p>;
  }

  return (
    <div 
      className="prose dark:prose-invert max-w-none text-[var(--text-primary)] break-words"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownPreview;