function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function embedPostMessageScript(parentOrigin: string | null | undefined): string {
  if (!parentOrigin?.trim()) return ''
  const origin = parentOrigin.trim()
  return `<script>try{var h=document.documentElement.scrollHeight;parent.postMessage({type:'dc-embed-ready',height:h},${JSON.stringify(origin)})}catch(e){}</script>`
}

export function buildOpsSummaryEmbedHtml(opts: {
  title: string
  readinessPct: number
  publishedCount: number
  totalSlots: number
  registrantBand: string
  integrationsOk: boolean
  cssVars?: Record<string, string>
  parentOrigin?: string | null
}): string {
  const rootVars = Object.entries(opts.cssVars ?? {})
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
  const rootStyle = rootVars ? `:root{${rootVars}}` : ''
  const pct = Math.min(100, Math.max(0, Math.round(opts.readinessPct)))
  const postMessage = embedPostMessageScript(opts.parentOrigin)
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(
    opts.title,
  )}</title><style>${rootStyle}body{font-family:system-ui,sans-serif;background:var(--dc-surface,#050504);color:var(--dc-text,#f7f3eb);margin:0;padding:12px}.ring{width:48px;height:48px;border-radius:50%;background:conic-gradient(var(--dc-accent,#c6a75e) ${pct * 3.6}deg,var(--dc-surface-muted,#0a0908) 0);display:flex;align-items:center;justify-content:center}.ring span{width:38px;height:38px;border-radius:50%;background:var(--dc-elevated,#0e0d0b);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}</style></head><body><div style="display:flex;gap:12px;align-items:center"><div class="ring"><span>${pct}%</span></div><div><p style="margin:0;font-size:14px;font-weight:600">${esc(opts.title)}</p><p style="margin:4px 0 0;font-size:12px;color:#9a9288">${opts.publishedCount}/${opts.totalSlots} sessions published · ${esc(opts.registrantBand)}</p><p style="margin:2px 0 0;font-size:11px;color:#8a7348">Integrations ${opts.integrationsOk ? '✓' : '—'}</p></div></div>${postMessage}</body></html>`
}
