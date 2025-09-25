#!/usr/bin/env ts-node
const { createClient } = require("@supabase/supabase-js");
const { normalizeMarkdown } = require("../src/lib/normalizeMarkdown.ts");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, content")
    .limit(1000);
  if (error) throw error;

  for (const row of data ?? []) {
    const fixed = normalizeMarkdown(row.content || "");
    if (fixed !== row.content) {
      const { error: upErr } = await supabase
        .from("articles")
        .update({ content: fixed })
        .eq("id", row.id);
      if (upErr) console.error(row.slug, upErr.message);
      else console.log("Fixed:", row.slug);
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
