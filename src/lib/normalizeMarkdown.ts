export function normalizeMarkdown(md: string): string {
  // Ensure a blank line before any table that starts with |
  md = md.replace(/([^\n])\n\|/g, (_m, prev) => `${prev}\n\n|`);

  // If a header row is immediately followed by another header row,
  // insert a separator line automatically for 2–6 columns.
  md = md.replace(
    /(\n\|[^|\n]+(?:\|[^|\n]+)+\|)\s*(\|[^-\n][^|\n]*\|)/g,
    (_, headerRow, nextRow) => {
      const colCount = headerRow.split("|").length - 2;
      const sep = "|" + Array(colCount).fill("---").join("|") + "|";
      return `\n${headerRow}\n${sep}\n${nextRow}`;
    }
  );

  return md;
}
