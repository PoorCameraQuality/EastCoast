import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET() {
  try {
    const client = supabase
    if (client) {
      const { data, error } = await client
        .from("articles")
        .select("slug, publish_date, last_updated, updated_at")
        .eq("status", "published")
        .order("publish_date", { ascending: false })

      if (!error && data?.length) {
        return NextResponse.json(
          data.map((a: { slug: string; publish_date?: string; last_updated?: string; updated_at?: string }) => ({
            slug: a.slug,
            updated: (a.last_updated || a.updated_at || a.publish_date || "").toString(),
          })),
          { status: 200 }
        )
      }
    }

    const { getAllArticles } = await import("@/data/education")
    const articles = getAllArticles?.() || []
    const rows = articles
      .filter((a: { slug?: string; status?: string }) => a?.slug && a?.status === "published")
      .map((a: { slug: string; lastUpdated?: string; publishDate?: string }) => ({
        slug: a.slug,
        updated: (a.lastUpdated || a.publishDate || "").toString(),
      }))

    return NextResponse.json(rows, { status: 200 })
  } catch (error) {
    console.error("[Sitemap API] Error loading articles:", error)
    return NextResponse.json([], { status: 200 })
  }
}
