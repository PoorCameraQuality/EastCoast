const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing environment variables:");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", url ? "✓" : "✗");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", key ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log("Creating backup of all articles...");
  
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, content")
    .limit(5000);

  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }

  fs.writeFileSync("./backup.articles.json", JSON.stringify(data ?? [], null, 2));
  console.log(`✅ Backup saved: backup.articles.json (${(data ?? []).length} articles)`);
}

main().catch((e) => {
  console.error("Backup failed:", e);
  process.exit(1);
});
