#!/usr/bin/env ts-node

import { createClient } from "@supabase/supabase-js";
import { normalizeMarkdown } from "../src/lib/normalizeMarkdown";

// IMPORTANT: run backup-articles.ts first
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function updateRow(id: string, content: string) {
  const { error } = await supabase
    .from("articles")
    .update({ content })
    .eq("id", id);
  if (error) throw error;
}

async function main() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, content")
    .limit(5000);
  if (error) throw error;

  let changed = 0;

  // Update in small batches to be gentle with rate limits
  const batchSize = 30;
  const rows = data ?? [];

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (row) => {
        const orig = row.content || "";
        const fixed = normalizeMarkdown(orig);
        if (fixed !== orig) {
          await updateRow(row.id, fixed);
          changed++;
          console.log(`✅ Fixed: ${row.slug}`);
        }
      })
    );

    // tiny pause between batches
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nUpdated ${changed} article(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
