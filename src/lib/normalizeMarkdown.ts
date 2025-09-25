// Strong, safe normalizer that also REPAIRS TABLES.
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
  md = md.replace(/([^\n])\s+(#{1,6}\s)/g, "$1\n\n$2");
  md = md.replace(/([^\n])\s+(\* |\d+\. |- )/g, "$1\n\n$2");
  md = md.replace(/([^\n])\s+(\|[^|\n]+(\|[^|\n]+)+\|)/g, "$1\n\n$2");

  // Repair tables: keep column counts consistent, merge continuation lines,
  // add missing separator row, escape stray pipes inside cell content.
  md = fixTables(md);

  // Final tidy
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.replace(/[ \t]+$/gm, "");

  return md.trim() + "\n";
}

// ---- Table repair ----
function fixTables(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];

  const reHeader = /^\|[^|]+(\|[^|]+)+\|$/;
  const reSep    = /^\|[-: ]+(\|[-: ]+)+\|$/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Not a table header -> copy and continue
    if (!reHeader.test(line)) {
      out.push(line);
      i++;
      continue;
    }

    // We found a header row
    const header = line;
    const expectedPipes = (header.match(/\|/g) || []).length;  // includes edges
    const expectedCols  = Math.max(expectedPipes - 1, 1);

    // Ensure blank line before header if needed
    if (out.length && out[out.length - 1].trim() !== "") out.push("");

    out.push(header);

    // Next line: separator (insert if missing)
    let j = i + 1;
    if (!reSep.test(lines[j] || "")) {
      out.push(
        "|" + Array(expectedCols).fill("---").join("|") + "|"
      );
    } else {
      out.push(lines[j]);
      j++;
    }

    // Collect body rows until blank line or non-table line
    let lastRowCells: string[] | null = null;

    while (j < lines.length) {
      const raw = lines[j];

      // End of table block
      if (!raw || (!raw.startsWith("|") && raw.trim() === "")) {
        if (raw?.trim() === "") out.push(""); // keep single blank as separator
        j++;
        break;
      }

      // Continuation line (does NOT start with "|" -> append to last cell)
      if (!raw.startsWith("|")) {
        if (lastRowCells) {
          const k = lastRowCells.length - 1;
          lastRowCells[k] = lastRowCells[k] + "<br>" + escapePipes(raw.trim());
        }
        j++;
        continue;
      }

      // Parse a row
      let row = raw;

      // Ensure trailing pipe so split is stable
      if (!row.endsWith("|")) row = row + " |";

      // Split into cells, trimming edges
      let cells = row.split("|").slice(1, -1).map((c) => c.trim());

      // If too few cells, pad on the right
      if (cells.length < expectedCols) {
        while (cells.length < expectedCols) cells.push("");
      }

      // If too many cells, merge extras into the last cell
      if (cells.length > expectedCols) {
        const head = cells.slice(0, expectedCols - 1);
        const tail = cells.slice(expectedCols - 1).join(" | ");
        cells = [...head, tail];
      }

      // Escape stray pipes inside cells so they don't become new columns
      cells = cells.map(escapePipes);

      // Emit the repaired row
      out.push("| " + cells.join(" | ") + " |");
      lastRowCells = cells;

      j++;
    }

    // Move i to the line after the processed table block
    i = j;
  }

  return out.join("\n");
}

function escapePipes(s: string): string {
  return s.replace(/\|/g, "\\|");
}