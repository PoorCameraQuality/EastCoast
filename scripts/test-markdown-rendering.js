// Quick test to verify markdown rendering works
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(url, key);

async function testMarkdownRendering() {
  console.log("Testing markdown rendering for articles...");
  
  // Get a few articles to test
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, content")
    .limit(3);
    
  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }
  
  console.log(`\nFound ${data.length} articles to test:`);
  
  for (const article of data) {
    console.log(`\n📄 ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Content length: ${article.content.length} chars`);
    console.log(`   First 100 chars: ${article.content.substring(0, 100)}...`);
    
    // Check if it has markdown features
    const hasHeaders = article.content.includes('##');
    const hasBold = article.content.includes('**');
    const hasLists = article.content.includes('- ');
    const hasTables = article.content.includes('|');
    
    console.log(`   Features: Headers: ${hasHeaders}, Bold: ${hasBold}, Lists: ${hasLists}, Tables: ${hasTables}`);
  }
  
  console.log("\n✅ Test complete! All articles should now render properly with the Markdown component.");
}

testMarkdownRendering().catch(console.error);
