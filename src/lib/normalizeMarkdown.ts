// Strong, safe normalizer for imported/pasted content.
export function normalizeMarkdown(raw: string): string {
  if (!raw) return "";

  let md = raw;

  // A) Decode escaped newlines/tabs and HTMLy breaks
  md = md
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")        // HTML <br> -> newline
    .replace(/&nbsp;/gi, " ")              // non-breaking spaces
    .replace(/\u00A0/g, " ");              // NBSP char

  // B) Site style: no em/en dashes
  md = md.replace(/[\u2014\u2013]/g, " - ");

  // C) Ensure block breaks before headings/lists/tables anywhere in a line
  md = md.replace(/([^\n])\s+(#{1,6}\s)/g, "$1\n\n$2");      // headings
  md = md.replace(/([^\n])\s+(\* |\d+\. |- )/g, "$1\n\n$2"); // lists
  md = md.replace(/([^\n])\s+(\|[^|\n]+(\|[^|\n]+)+\|)/g, "$1\n\n$2"); // table header

  // D) Add table separator after a header row if missing
  md = md.replace(
    /(^|\n)(\|[^|\n]+(\|[^|\n]+)+\|)\n(?!\|[-:\s]+(\|[-:\s]+)+\|)/g,
    (_m, lead, header) => {
      const pipes = (header.match(/\|/g) || []).length;
      const cells = Math.max(pipes - 1, 1);
      const sep = "|" + Array(cells).fill("---").join("|") + "|";
      return `${lead}${header}\n${sep}\n`;
    }
  );

  // E) At most 2 blank lines; trim trailing spaces; ensure final newline
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.replace(/[ \t]+$/gm, "");

  return md.trim() + "\n";
}