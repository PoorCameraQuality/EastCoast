export function normalizeMarkdown(raw: string): string {
  if (!raw) return "";
  
  // More aggressive normalization for "blob" content
  let md = raw;
  
  // 1. Replace em/en dashes
  md = md.replace(/[\u2014\u2013]/g, " - ");
  
  // 2. Fix common "blob" issues - add paragraph breaks where needed
  // Add line breaks after sentences that end with periods and are followed by capital letters
  md = md.replace(/([.!?])\s*([A-Z][a-z])/g, "$1\n\n$2");
  
  // 3. Add line breaks before headings that are stuck to text
  md = md.replace(/([a-z])(#{1,6}\s)/g, "$1\n\n$2");
  
  // 4. Add line breaks before lists that are stuck to text
  md = md.replace(/([a-z])(\s*[-*]\s)/g, "$1\n\n$2");
  md = md.replace(/([a-z])(\s*\d+\.\s)/g, "$1\n\n$2");
  
  // 5. Add line breaks before tables
  md = md.replace(/([a-z])(\s*\|)/g, "$1\n\n$2");
  
  // 6. Fix multiple spaces and normalize whitespace
  md = md.replace(/\s+/g, " ");
  
  // 7. Now process line by line for final cleanup
  const reTableHeader = /^\|[^|]+(\|[^|]+)+\|$/;
  const reTableSep    = /^\|[-: ]+(\|[-: ]+)+\|$/;
  const reHeading     = /^#{1,6} /;
  const reList        = /^(\* |- |\d+\. )/;

  const lines = md.split("\n");
  const out = [];
  let blankRun = 0;

  for (let i = 0; i < lines.length; i++) {
    const curr = lines[i]?.trim() ?? "";
    const next = i < lines.length - 1 ? (lines[i + 1]?.trim() ?? "") : "";
    const isBlank = curr === "";

    // keep at most 2 blank lines
    if (isBlank) {
      if (++blankRun <= 2) out.push("");
      continue;
    } else {
      blankRun = 0;
    }

    // table header: ensure blank line before + separator after
    if (reTableHeader.test(curr) && !reTableSep.test(curr)) {
      if (out.length && out[out.length - 1] !== "") out.push("");
      out.push(curr);
      if (!reTableSep.test(next)) {
        const pipes = (curr.match(/\|/g) || []).length;
        const cells = Math.max(pipes - 1, 1);
        out.push("|" + Array(cells).fill("---").join("|") + "|");
      }
      continue;
    }

    // headings/lists: ensure blank line before
    if (reHeading.test(curr) || reList.test(curr)) {
      if (out.length && out[out.length - 1] !== "") out.push("");
      out.push(curr);
      continue;
    }

    out.push(curr);
  }

  return out.join("\n").trim() + "\n";
}