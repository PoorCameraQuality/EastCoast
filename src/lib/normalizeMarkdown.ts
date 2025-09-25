export function normalizeMarkdown(raw: string): string {
  if (!raw) return "";
  const reTableHeader = /^\|[^|]+(\|[^|]+)+\|$/;
  const reTableSep    = /^\|[-: ]+(\|[-: ]+)+\|$/;
  const reHeading     = /^#{1,6} /;
  const reList        = /^(\* |- |\d+\. )/;

  // replace em/en dashes
  let md = raw.replace(/[\u2014\u2013]/g, " - ");

  const lines = md.split("\n");
  const out: string[] = [];
  let blankRun = 0;

  for (let i = 0; i < lines.length; i++) {
    const curr = lines[i] ?? "";
    const next = i < lines.length - 1 ? (lines[i + 1] ?? "") : "";
    const isBlank = curr.trim() === "";

    // keep at most 2 blank lines
    if (isBlank) {
      if (++blankRun <= 2) out.push(curr);
      continue;
    } else {
      blankRun = 0;
    }

    // table header: ensure blank line before + separator after
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

    // headings/lists: ensure blank line before
    if (reHeading.test(curr) || reList.test(curr)) {
      if (out.length && out[out.length - 1].trim() !== "") out.push("");
      out.push(curr);
      continue;
    }

    out.push(curr);
  }

  return out.join("\n").trim() + "\n";
}
