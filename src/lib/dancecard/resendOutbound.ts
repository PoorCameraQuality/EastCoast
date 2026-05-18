/** Server-only: send transactional email via [Resend](https://resend.com/docs/send-with-nodejs). */

export async function sendViaResend(args: { to: string; subject: string; text: string }): Promise<{ id: string }> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.DANCECARD_RESEND_FROM
  if (!key || !from) {
    throw new Error('RESEND_NOT_CONFIGURED')
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: args.to,
      subject: args.subject,
      text: args.text,
    }),
  })
  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
  if (!res.ok) {
    const msg = typeof json.message === 'string' ? json.message : `Resend HTTP ${res.status}`
    throw new Error(msg)
  }
  return { id: String(json.id ?? '') }
}
