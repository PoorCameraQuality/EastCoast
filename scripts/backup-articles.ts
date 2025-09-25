#!/usr/bin/env ts-node

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, content")
    .limit(5000);

  if (error) throw error;

  fs.writeFileSync("./backup.articles.json", JSON.stringify(data ?? [], null, 2));
  console.log(`Backup saved: backup.articles.json (${(data ?? []).length} rows)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
