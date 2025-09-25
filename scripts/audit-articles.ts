#!/usr/bin/env ts-node

import { createClient } from "@supabase/supabase-js";
import { normalizeMarkdown } from "../src/lib/normalizeMarkdown";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, content")
    .limit(5000);
  if (error) throw error;

  let touched = 0;
  for (const row of data ?? []) {
    const orig = row.content || "";
    const fixed = normalizeMarkdown(orig);
    if (fixed !== orig) {
      touched++;
      console.log(`Would fix: ${row.slug}`);
    }
  }
  console.log(`\nTotal to fix: ${touched}/${data?.length ?? 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
