export function normalizeMarkdown(raw: string): string {
  if (!raw) return "";

  let md = raw;

  // 1) Decode escaped newlines/tabs from CSV/SQL imports
  md = md
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n?/g, "\n");

  // 2) Replace em/en dashes with spaced hyphen (your site-wide style)
  md = md.replace(/[\u2014\u2013]/g, " - ");

  // 3) If headings/lists/tables appear without a preceding newline,
  //    inject a block break before them.
  // Headings anywhere in the text
  md = md.replace(/([^\n])\s+(#{1,6}\s)/g, "$1\n\n$2");
  // Lists anywhere in the text
  md = md.replace(/([^\n])\s+(\* |\d+\. |- )/g, "$1\n\n$2");
  // Table header anywhere in the text
  md = md.replace(/([^\n])\s+(\|[^|\n]+(\|[^|\n]+)+\|)/g, "$1\n\n$2");

  // 4) Ensure table separator after a header row if missing
  md = md.replace(
    /(^|\n)(\|[^|\n]+(\|[^|\n]+)+\|)\n(?!\|[-:\s]+(\|[-:\s]+)+\|)/g,
    (_m, lead, header) => {
      const pipes = (header.match(/\|/g) || []).length;
      const cells = Math.max(pipes - 1, 1);
      const sep = "|" + Array(cells).fill("---").join("|") + "|";
      return `${lead}${header}\n${sep}\n`;
    }
  );

  // 5) Collapse 3+ blank lines to 2; trim trailing spaces; final newline
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.replace(/[ \t]+$/gm, "");

  return md.trim() + "\n";
}