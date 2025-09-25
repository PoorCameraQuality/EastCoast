"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/** Wrap tables for horizontal scroll on mobile */
const rehypeWrapTables: Plugin = () => {
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (node.tagName === "table" && parent && Array.isArray(parent.children) && typeof index === 'number') {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrap"] },
          children: [node],
        };
      }
    });
  };
};

// Extend the sanitize schema to allow the harmless HTML your posts use
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // allow classes on div/span/p for design niceties if present
    div: [...(defaultSchema.attributes?.div || []), ["className"]],
    span: [...(defaultSchema.attributes?.span || []), ["className"]],
    p: [...(defaultSchema.attributes?.p || []), ["className"]],
    a: [
      ...(defaultSchema.attributes?.a || []),
      ["target"],
      ["rel"],
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
      ["alt"],
      ["title"],
      ["width"],
      ["height"],
      ["loading"],
      ["decoding"],
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // common, safe inline/structural tags
    "br",
    "hr",
    "em",
    "i",
    "strong",
    "u",
    "blockquote",
    "figure",
    "figcaption",
    "sup",
    "sub",
  ],
};

type Props = { content: string };

export default function Markdown({ content }: Props) {
  return (
    <div className="prose prose-invert article-prose max-w-3xl lg:max-w-4xl">
      <ReactMarkdown
        // GFM: tables, strikethrough, task lists, autolinks
        remarkPlugins={[remarkGfm, remarkBreaks]}
        // Allow safe HTML (for posts that contain <em>, <br>, etc.)
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeWrapTables]}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
