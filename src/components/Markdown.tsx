"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = { content: string };

export default function Markdown({ content }: Props) {
  return (
    <div className="prose prose-invert article-prose max-w-3xl lg:max-w-4xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
