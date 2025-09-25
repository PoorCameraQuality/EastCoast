// Test the normalizeMarkdown function directly
function normalizeMarkdown(raw) {
  if (!raw) return "";
  const reTableHeader = /^\|[^|]+(\|[^|]+)+\|$/;
  const reTableSep    = /^\|[-: ]+(\|[-: ]+)+\|$/;
  const reHeading     = /^#{1,6} /;
  const reList        = /^(\* |- |\d+\. )/;

  // replace em/en dashes
  let md = raw.replace(/[\u2014\u2013]/g, " - ");

  const lines = md.split("\n");
  const out = [];
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

// Test with sample content that might be causing issues
const testContent = `# What Is KAP
This is some text that runs into the next heading.
## A (Age Play)
This is content that should be separated.
- List item 1
- List item 2
More text here.`;

console.log("--- Original Content ---");
console.log(JSON.stringify(testContent));

console.log("\n--- Normalized Content ---");
const normalized = normalizeMarkdown(testContent);
console.log(JSON.stringify(normalized));

console.log("\n--- Visual Comparison ---");
console.log("ORIGINAL:");
console.log(testContent);
console.log("\nNORMALIZED:");
console.log(normalized);
