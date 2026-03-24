import { NextResponse } from 'next/server'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().trim().email().max(320),
})

export async function POST(request: Request) {
  const apiKey = process.env.BUTTONDOWN_API_KEY
  if (!apiKey) {
    console.error('[newsletter] BUTTONDOWN_API_KEY is not set')
    return NextResponse.json(
      { ok: false, error: 'Newsletter signup is not configured.' },
      { status: 503 }
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 })
  }

  const { email } = parsed.data

  try {
    const res = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({ email_address: email }),
    })

    if (res.ok) {
      return NextResponse.json({ ok: true })
    }

    const text = await res.text().catch(() => '')
    console.error('[newsletter] Buttondown error', res.status, text.slice(0, 500))

    if (res.status === 400 || res.status === 422) {
      return NextResponse.json(
        { ok: false, error: 'Could not add that address. It may already be subscribed.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again later.' }, { status: 502 })
  } catch (e) {
    console.error('[newsletter] Request failed', e)
    return NextResponse.json({ ok: false, error: 'Network error. Try again later.' }, { status: 502 })
  }
}
