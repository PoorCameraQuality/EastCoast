"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

type Props = { content: string; className?: string };

export default function MarkdownSimple({ content, className = "" }: Props) {
  return (
    <div className={`prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
