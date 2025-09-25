// Safe Markdown normalizer used for all articles DB-wide.
// Rules:
//  - Replace em/en dashes with spaced hyphen (—/– -> ' - ')
//  - Ensure blank line before tables, headings, and lists
//  - If a table header is missing a separator row, insert it
//  - Collapse 3+ blank lines to 2 (keeps normal single-spacing between blocks)
//  - Do NOT touch fenced code blocks' spacing.

export function normalizeMarkdown(raw: string): string {
  if (!raw) return raw;

  let md = raw;

  // 1) Replace em/en dashes with spaced hyphen
  md = md.replace(/[\u2014\u2013]/g, " - ");

  // We'll process line-by-line to avoid wrecking formatting
  const lines = md.split("\n");
  const out: string[] = [];

  const reTableHeader = /^\|[^|]+(\|[^|]+)+\|$/; // e.g., | A | B | C |
  const reTableSep    = /^\|[-: ]+(\|[-: ]+)+\|$/;
  const reHeading     = /^#{1,6} /;
  const reList        = /^(\* |- |\d+\. )/;

  let blankRun = 0;
  for (let i = 0; i < lines.length; i++) {
    const curr = lines[i] ?? "";
    const prev = i > 0 ? (lines[i - 1] ?? "") : "";
    const next = i < lines.length - 1 ? (lines[i + 1] ?? "") : "";

    const isBlank = curr.trim() === "";

    // Keep at most TWO consecutive blank lines (single-spaced sections)
    if (isBlank) {
      blankRun++;
      if (blankRun <= 2) out.push(curr);
      continue;
    } else {
      blankRun = 0;
    }

    // Table header? (not a separator)
    if (reTableHeader.test(curr) && !reTableSep.test(curr)) {
      // Ensure a blank line before
      if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");

      out.push(curr);

      // Ensure separator after header
      if (!reTableSep.test(next)) {
        // Count cells: pipes minus 1
        const pipes = (curr.match(/\|/g) || []).length;
        const cells = Math.max(pipes - 1, 1);
        const sep = "|" + Array(cells).fill("---").join("|") + "|";
        out.push(sep);
      }

      continue;
    }

    // Headings & list items: ensure blank line before
    if (reHeading.test(curr) || reList.test(curr)) {
      if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");
      out.push(curr);
      continue;
    }

    out.push(curr);
  }

  // Join + trim outer whitespace + ensure one trailing newline
  return out.join("\n").trim() + "\n";
}
