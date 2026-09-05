import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isUser = false }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  if (isUser) {
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  // Normalize LaTeX delimiters for remark-math
  // 1. Convert \[ ... \] to $$ ... $$
  // 2. Convert \( ... \) to $ ... $
  let normalizedContent = content
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$\n$1\n$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$1$');

  let codeBlockCounter = 0;

  return (
    <div className="markdown-content text-sm leading-relaxed space-y-2.5 overflow-x-auto text-slate-800 dark:text-slate-100">
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1 pb-1 border-b border-slate-200 dark:border-slate-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-2.5 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-2 mb-0.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed mb-1.5 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 my-1.5 marker:text-blue-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 my-1.5 marker:text-blue-500 font-normal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500/60 pl-3 py-0.5 my-2 text-slate-600 dark:text-slate-400 italic bg-blue-50/40 dark:bg-blue-950/20 rounded-r-lg">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="border-t border-slate-200 dark:border-slate-800 my-3" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-500 transition-colors"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 dark:text-slate-300">
              {children}
            </em>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300">{children}</td>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-[12px]">
                  {children}
                </code>
              );
            }

            const currentCodeIndex = ++codeBlockCounter;
            const codeString = String(children).replace(/\n$/, '');
            const langMatch = /language-(\w+)/.exec(className || '');
            const language = langMatch ? langMatch[1] : '';

            return (
              <div className="my-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden text-xs shadow-sm">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                  <span>{language || 'code'}</span>
                  <button
                    onClick={() => handleCopyCode(codeString, currentCodeIndex)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCodeIndex === currentCodeIndex ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 overflow-x-auto font-mono text-[12px] leading-relaxed">
                  <code>{children}</code>
                </div>
              </div>
            );
          },
        }}
      >
        {normalizedContent}
      </Markdown>
    </div>
  );
};
