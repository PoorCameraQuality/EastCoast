import type { PublicProgramSlotDto } from '@/lib/dancecard/publicProgramSlotsData'
import { assertHttpsImageUrl } from '@/lib/security/safeUrl'

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type EmbedChromeOptions = {
  chrome?: 'default' | 'minimal'
  eventSlug?: string
  publicHost?: string
  /** Parent frame origin for postMessage (omit to skip height notification). */
  parentOrigin?: string | null
}

function embedPostMessageScript(parentOrigin: string | null | undefined): string {
  if (!parentOrigin?.trim()) return ''
  const origin = parentOrigin.trim()
  return `<script>try{var h=document.documentElement.scrollHeight;parent.postMessage({type:'dc-embed-ready',height:h},${JSON.stringify(origin)})}catch(e){}</script>`
}

export function buildScheduleEmbedHtml(
  title: string,
  slots: PublicProgramSlotDto[],
  cssVars: Record<string, string> = {},
  opts: EmbedChromeOptions = {},
): string {
  const rootVars = Object.entries(cssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
  const rootStyle = rootVars ? `:root{${rootVars}}` : ''
  const rows = slots
    .map(
      (s) =>
        `<tr><td>${esc(new Date(s.startsAt).toLocaleString())}</td><td>${esc(s.title)}</td><td>${esc(
          s.room ?? '',
        )}</td><td>${esc(s.trackDisplay ?? s.track ?? '')}</td></tr>`,
    )
    .join('')
  const minimal = opts.chrome === 'minimal'
  const label = minimal
    ? ''
    : '<p style="font-size:11px;text-transform:uppercase;letter-spacing:.2em;color:#64748b">Dancecard embed</p>'
  const host = (opts.publicHost ?? '').replace(/\/$/, '')
  const slug = opts.eventSlug?.toLowerCase() ?? ''
  const fullLink =
    minimal && host && slug
      ? `<p style="margin:0 0 12px"><a href="${esc(`${host}/dancecard/${slug}`)}" target="_blank" rel="noopener">Open full program on Dancecard →</a></p>`
      : ''
  const postMessage = embedPostMessageScript(opts.parentOrigin)
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${esc(
    title,
  )}</title><style>${rootStyle}body{font-family:system-ui,sans-serif;background:var(--dc-surface,#050504);color:var(--dc-text,#f7f3eb);margin:0;padding:12px}a{color:var(--event-accent,var(--dc-accent,#c6a75e))}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border-bottom:1px solid rgba(255,255,255,.08);padding:6px 4px;text-align:left}th{color:#9a9288;font-weight:600}@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}</style></head><body>${label}${fullLink}<h1 style="font-size:18px;margin:0 0 12px">${esc(
    title,
  )}</h1><table><thead><tr><th>Starts</th><th>Session</th><th>Room</th><th>Track</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No published sessions.</td></tr>'}</tbody></table>${postMessage}</body></html>`
}

export function buildMapEmbedHtml(
  title: string,
  maps: { title: string; imageUrl: string | null }[],
  cssVars: Record<string, string> = {},
): string {
  const rootVars = Object.entries(cssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
  const rootStyle = rootVars ? `:root{${rootVars}}` : ''
  const blocks = maps
    .map((m) => {
      const src = assertHttpsImageUrl(m.imageUrl)
      if (!src) return ''
      return `<section style="margin-bottom:16px"><h2 style="font-size:14px;margin:0 0 8px">${esc(m.title)}</h2><img src="${esc(src)}" alt="" style="max-width:100%;border-radius:8px;border:1px solid rgba(255,255,255,.1)"/></section>`
    })
    .filter(Boolean)
    .join('')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${esc(
    title,
  )} — maps</title><style>${rootStyle}body{font-family:system-ui,sans-serif;background:var(--dc-surface,#050504);color:var(--dc-text,#f7f3eb);margin:0;padding:12px}@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}</style></head><body><h1 style="font-size:18px">${esc(
    title,
  )}</h1>${blocks || '<p>No map images.</p>'}</body></html>`
}
