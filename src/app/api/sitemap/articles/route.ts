import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  // Return empty array to unblock builds
  // Articles can be wired to Supabase later once schema is fixed
  return NextResponse.json([], { status: 200 })
}
