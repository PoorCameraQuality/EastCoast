/** Build vCard 3.0 text for contact sharing. */
export function buildVCard3(args: {
  displayName: string
  username?: string
  email?: string | null
  phone?: string | null
  url?: string | null
  note?: string | null
}): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVCard(args.displayName)}`]
  if (args.username) lines.push(`NICKNAME:${escapeVCard(args.username)}`)
  if (args.email?.trim()) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(args.email.trim())}`)
  if (args.phone?.trim()) lines.push(`TEL;TYPE=CELL:${escapeVCard(args.phone.trim())}`)
  if (args.url?.trim()) lines.push(`URL:${escapeVCard(args.url.trim())}`)
  if (args.note?.trim()) lines.push(`NOTE:${escapeVCard(args.note.trim())}`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

function escapeVCard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}
