const { createClient } = require("@supabase/supabase-js");

// Simple normalizeMarkdown function (copied from the TypeScript version)
function normalizeMarkdown(md) {
  // Ensure a blank line before any table that starts with |
  md = md.replace(/([^\n])\n\|/g, (match, prev) => `${prev}\n\n|`);

  // If a header row is immediately followed by another header row,
  // insert a separator line automatically for 2–6 columns.
  md = md.replace(
    /(\n\|[^|\n]+(?:\|[^|\n]+)+\|)\s*(\|[^-\n][^|\n]*\|)/g,
    (match, headerRow, nextRow) => {
      const colCount = headerRow.split("|").length - 2;
      const sep = "|" + Array(colCount).fill("---").join("|") + "|";
      return `\n${headerRow}\n${sep}\n${nextRow}`;
    }
  );

  return md;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing environment variables:");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", url ? "✓" : "✗");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", key ? "✓" : "✗");
  console.error("\nPlease set these environment variables and try again.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log("Fetching articles...");
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, content")
    .limit(1000);
  
  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }

  console.log(`Found ${data.length} articles`);
  
  let fixedCount = 0;
  
  for (const row of data) {
    const fixed = normalizeMarkdown(row.content || "");
    if (fixed !== row.content) {
      console.log(`Fixing article: ${row.slug}`);
      const { error: upErr } = await supabase
        .from("articles")
        .update({ content: fixed })
        .eq("id", row.id);
      
      if (upErr) {
        console.error(`Error updating ${row.slug}:`, upErr.message);
      } else {
        console.log(`✓ Fixed: ${row.slug}`);
        fixedCount++;
      }
    }
  }
  
  console.log(`\nCompleted! Fixed ${fixedCount} articles.`);
}

run().catch((e) => {
  console.error("Script failed:", e);
  process.exit(1);
});
