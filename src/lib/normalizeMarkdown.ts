export function normalizeMarkdown(raw: string): string {
  if (!raw) return "";

  let md = raw;

  // 1) Decode escaped newlines/tabs from CSV/SQL imports
  //    Turns literal "\r\n", "\n", "\r", "\t" into real characters
  md = md
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t");

  // Normalize real CRLF to \n
  md = md.replace(/\r\n?/g, "\n");

  // 2) Swap em/en dashes for spaced hyphen (your site-wide choice)
  md = md.replace(/[\u2014\u2013]/g, " - ");

  // 3) Ensure block breaks before headings/lists/tables
  const lines = md.split("\n");
  const out: string[] = [];

  const reTableHeader = /^\|[^|]+(\|[^|]+)+\|$/;
  const reTableSep    = /^\|[-: ]+(\|[-: ]+)+\|$/;
  const reHeading     = /^#{1,6} /;
  const reList        = /^(\* |- |\d+\. )/;

  let blankRun = 0;
  for (let i = 0; i < lines.length; i++) {
    const curr = lines[i] ?? "";
    const next = i < lines.length - 1 ? (lines[i + 1] ?? "") : "";
    const isBlank = curr.trim() === "";

    // Keep at most 2 consecutive blanks (single-spaced sections)
    if (isBlank) {
      if (++blankRun <= 2) out.push(curr);
      continue;
    }
    blankRun = 0;

    // Table header → ensure blank line before + separator after
    if (reTableHeader.test(curr) && !reTableSep.test(curr)) {
      if (out.length && out[out.length - 1].trim() !== "") out.push("");
      out.push(curr);
      if (!reTableSep.test(next)) {
        const pipes = (curr.match(/\|/g) || []).length;
        const cells = Math.max(pipes - 1, 1);
        out.push("|" + Array(cells).fill("---").join("|") + "|");
      }
      continue;
    }

    // Headings / list items → ensure blank line before
    if (reHeading.test(curr) || reList.test(curr)) {
      if (out.length && out[out.length - 1].trim() !== "") out.push("");
      out.push(curr);
      continue;
    }

    out.push(curr);
  }

  return out.join("\n").trim() + "\n";
}