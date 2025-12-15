"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

import "katex/dist/katex.min.css";

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          strong: ({ children }) => (
            <span className="dialogue">{children}</span>
          ),
          em: ({ children }) => <span className="action">{children}</span>,
          a: ({ href, children }) => (
            <a href={href} style={{ color: "var(--color-link)" }}>
              {children}
            </a>
          ),
          code: ({ children }) => <code>{children}</code>,
          pre: ({ children }) => <pre className="code-block">{children}</pre>,
          span: ({ children, className }) => {
            return <span className={className}>{children}</span>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
