// Beautifies imported/pasted content so it renders like a human wrote it.
export function normalizeMarkdown(raw: string): string {
  if (!raw) return "";

  let md = raw;

  // --- Decode common import artifacts ---
  md = md
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ");

  // Site style: no em/en dashes
  md = md.replace(/[\u2014\u2013]/g, " - ");

  // Ensure block breaks before headings/lists/tables found mid-line
  md = md.replace(/([^\n])\s+(#{1,6}\s)/g, "$1\n\n$2");      // headings
  md = md.replace(/([^\n])\s+(\* |\d+\. |- )/g, "$1\n\n$2"); // lists
  md = md.replace(/([^\n])\s+(\|[^|\n]+(\|[^|\n]+)+\|)/g, "$1\n\n$2"); // table header

  // Repair & simplify tables (pad/merge cells, drop empty columns, etc.)
  md = fixTables(md);

  // Final tidy: collapse >2 blank lines; trim trailing spaces; ensure final newline
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.replace(/[ \t]+$/gm, "");
  return md.trim() + "\n";
}

/* ---------- TABLE REPAIR ---------- */
function fixTables(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];

  const reHeader = /^\|[^|]+(\|[^|]+)+\|$/;
  const reSep    = /^\|[-: ]+(\|[-: ]+)+\|$/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!reHeader.test(line)) { out.push(line); i++; continue; }

    // Header row and expected column count
    const header = line;
    const expectedCols = Math.max((header.match(/\|/g) || []).length - 1, 1);

    // Ensure blank line before the table
    if (out.length && out[out.length - 1].trim() !== "") out.push("");
    let j = i + 1;

    // Separator row (insert if missing)
    const sepLine = reSep.test(lines[j] || "")
      ? lines[j++]
      : "|" + Array(expectedCols).fill("---").join("|") + "|";

    // Collect body rows
    const rawRows: string[] = [];
    while (j < lines.length) {
      const r = lines[j];
      if (!r || (!r.startsWith("|") && r.trim() === "")) { if (r?.trim() === "") j++; break; }
      rawRows.push(r);
      j++;
    }

    // Parse rows into matrix of cells
    let rows: string[][] = [];
    let last: string[] | null = null;

    const toCells = (r: string): string[] => {
      let L = r;
      if (!L.endsWith("|")) L += " |";
      return L.split("|").slice(1, -1).map((c) => c.trim());
    };

    for (const r of rawRows) {
      if (!r.startsWith("|")) {
        if (last) last[last.length - 1] += "<br>" + escapePipes(r.trim());
        continue;
      }
      let cells = toCells(r);

      // Pad or merge to expected column count
      if (cells.length < expectedCols) while (cells.length < expectedCols) cells.push("");
      if (cells.length > expectedCols) {
        const head = cells.slice(0, expectedCols - 1);
        const tail = cells.slice(expectedCols - 1).join(" | ");
        cells = [...head, tail];
      }

      // Escape stray pipes
      cells = cells.map(escapePipes);

      rows.push(cells);
      last = cells;
    }

    // DROP columns that are empty or just dashes in ~all rows
    const drop: boolean[] = new Array(expectedCols).fill(false);
    for (let c = 0; c < expectedCols; c++) {
      const allEmptyOrDash = rows.length > 0 && rows.every((r) => {
        const v = (r[c] || "").trim();
        return v === "" || /^-+$/.test(v);
      });
      if (allEmptyOrDash) drop[c] = true;
    }

    const keepIdx: number[] = [];
    for (let c = 0; c < expectedCols; c++) if (!drop[c]) keepIdx.push(c);
    const hasDrop = keepIdx.length !== expectedCols;

    const select = (arr: string[]) => keepIdx.map((k) => arr[k] ?? "");

    // Emit repaired table
    out.push("| " + select(toCells(header)).join(" | ") + " |");
    out.push(
      hasDrop
        ? "|" + keepIdx.map(() => "---").join("|") + "|"
        : sepLine
    );
    for (const r of rows) out.push("| " + select(r).join(" | ") + " |");

    // Step
    i = j;
  }

  return out.join("\n");
}

function escapePipes(s: string): string {
  return s.replace(/\|/g, "\\|");
}