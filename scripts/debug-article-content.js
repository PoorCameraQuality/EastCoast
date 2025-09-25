const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(url, key);

async function debugArticleContent() {
  console.log("Debugging article content...");
  
  // Get one problematic article
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, content")
    .eq("slug", "what-is-kap-directory-guide")
    .single();
    
  if (error) {
    console.error("Error fetching article:", error);
    return;
  }
  
  console.log(`\n📄 Article: ${data.title}`);
  console.log(`   Slug: ${data.slug}`);
  console.log(`   Content length: ${data.content.length} chars`);
  
  // Show first 500 characters
  console.log("\n--- First 500 characters ---");
  console.log(data.content.substring(0, 500));
  
  // Check for specific patterns
  const hasHeaders = data.content.includes('##');
  const hasBold = data.content.includes('**');
  const hasLists = data.content.includes('- ');
  const hasTables = data.content.includes('|');
  const hasLineBreaks = data.content.includes('\n');
  const hasHTML = data.content.includes('<');
  
  console.log("\n--- Content Analysis ---");
  console.log(`Has headers (##): ${hasHeaders}`);
  console.log(`Has bold (**): ${hasBold}`);
  console.log(`Has lists (- ): ${hasLists}`);
  console.log(`Has tables (|): ${hasTables}`);
  console.log(`Has line breaks (\\n): ${hasLineBreaks}`);
  console.log(`Has HTML (<): ${hasHTML}`);
  
  // Count line breaks
  const lineBreakCount = (data.content.match(/\n/g) || []).length;
  console.log(`Line break count: ${lineBreakCount}`);
  
  // Show a sample with line breaks
  console.log("\n--- Sample with line breaks visible ---");
  const sample = data.content.substring(0, 200).replace(/\n/g, '\\n');
  console.log(sample);
}

debugArticleContent().catch(console.error);
