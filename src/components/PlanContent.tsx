"use client";

import ReactMarkdown from "react-markdown";

/**
 * Renders plan section content as formatted markdown.
 * Used in both client plan view and coach review page.
 */
export default function PlanContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm prose-stone max-w-none text-stone-700">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-stone-900 mt-4 mb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-stone-900 mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-stone-800 mt-3 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-stone-700 mb-3 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-stone-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm text-stone-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-stone-900">{children}</strong>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse border border-stone-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-stone-100">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-stone-200 px-3 py-2 text-left text-xs font-semibold text-stone-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-stone-200 px-3 py-2 text-sm text-stone-600">
              {children}
            </td>
          ),
          hr: () => <hr className="my-4 border-stone-200" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-amber-300 bg-amber-50 pl-4 py-2 my-3 text-sm text-stone-700 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
