import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"

/** Serves the C2K teal palette preview; avoids relying on `public/` static delivery alone. */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "c2k-brand-color-options.html")
    const html = await readFile(filePath, "utf-8")
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    })
  } catch {
    return new NextResponse(
      "<!DOCTYPE html><html><body><pre>Missing public/c2k-brand-color-options.html — run dev from the EastCoast-master repo root.</pre></body></html>",
      {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }
}
