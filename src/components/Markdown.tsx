"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";      // turns single \n into <br>
import rehypeRaw from "rehype-raw";            // allow safe inline HTML
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";

const rehypeWrapTables: Plugin = () => (tree: any) => {
  visit(tree, "element", (node: any, i: number | undefined, parent: any) => {
    if (node.tagName === "table" && parent && Array.isArray(parent.children) && typeof i === 'number') {
      parent.children[i] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-wrap"] },
        children: [node],
      };
    }
  });
};

// permit harmless HTML your posts use
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "br","hr","em","i","strong","u","blockquote","figure","figcaption","sup","sub"
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), ["target"], ["rel"]],
    img: [...(defaultSchema.attributes?.img || []), ["alt"], ["title"], ["width"], ["height"], ["loading"], ["decoding"]],
    div: [...(defaultSchema.attributes?.div || []), ["className"]],
    span:[...(defaultSchema.attributes?.span||[]),["className"]],
    p:   [...(defaultSchema.attributes?.p||[]),   ["className"]],
  },
};

export default function Markdown({ content }: {content: string}) {
  return (
    <div className="prose prose-invert article-prose max-w-3xl lg:max-w-4xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeWrapTables]}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
