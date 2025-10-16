import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('[Sitemap API] Missing Supabase environment variables')
      return NextResponse.json([], { status: 200 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createClient(url, key, { auth: { persistSession: false } })

    // Fetch events with limited fields for performance
    const { data, error } = await supabase
      .from("events")
      .select("slug,updated_at,publish_date")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(2000) // Reasonable limit for sitemap

    if (error) {
      console.error('[Sitemap API] Error fetching events:', error)
      return NextResponse.json([], { status: 200 })
    }

    // Return events with slug and last modified date
    const events = (data || []).map(event => ({
      slug: event.slug,
      updated: event.updated_at || event.publish_date
    }))

    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    console.error('[Sitemap API] Unexpected error fetching events:', error)
    return NextResponse.json([], { status: 200 })
  }
}
