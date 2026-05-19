'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { PALETTE_PRESETS, type PalettePreset } from '@/lib/dancecard/paletteLabPresets'

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="min-w-0">
      <div className="h-10 rounded-md border border-black/10 shadow-inner" style={{ backgroundColor: hex }} title={hex} />
      <p className="mt-1 truncate text-[10px] font-medium text-[var(--dc-text)]">{label}</p>
      <p className="font-mono text-[9px] text-[var(--dc-muted)]">{hex}</p>
    </div>
  )
}

function PaletteMock({ preset }: { preset: PalettePreset }) {
  const style = preset.vars as CSSProperties
  const outside = preset.vars['--dc-compare-outside'] ?? preset.vars['--dc-surface-muted'] ?? '#ccc'

  const swatches = [
    { label: 'Surface', hex: preset.vars['--dc-surface'] ?? '' },
    { label: 'Muted bg', hex: preset.vars['--dc-surface-muted'] ?? '' },
    { label: 'Card', hex: preset.vars['--dc-elevated-solid'] ?? '' },
    { label: 'Text', hex: preset.vars['--dc-text'] ?? '' },
    { label: 'Muted', hex: preset.vars['--dc-text-muted'] ?? '' },
    { label: 'Accent', hex: preset.vars['--dc-accent'] ?? '' },
  ]

  return (
    <section id={preset.id} className="scroll-mt-20 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5" style={style}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-xl text-[var(--dc-text)] sm:text-2xl">{preset.name}</h2>
          <p className="mt-1 text-sm text-[var(--dc-muted)]">{preset.tagline}</p>
          <p className="mt-1 text-xs text-[var(--dc-accent)]">Best for: {preset.bestFor}</p>
        </div>
        <a href={`#${preset.id}`} className="shrink-0 text-xs text-[var(--dc-muted)] underline hover:text-[var(--dc-accent)]">
          #{preset.id}
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {swatches.map((s) => (
          <Swatch key={s.label} {...s} />
        ))}
      </div>

      <div
        className="mt-4 overflow-hidden rounded-xl border border-[var(--dc-border-subtle)] bg-[var(--dc-surface)] text-[var(--dc-text)] shadow-lg"
        style={style}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--dc-border-subtle)] bg-[var(--dc-surface-muted)] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dc-accent)] text-xs font-bold text-[var(--dc-accent-foreground)]">
              DC
            </span>
            <span className="font-serif text-sm font-medium">Sandbox Con 2026</span>
          </div>
          <span className="text-xs font-semibold text-[var(--dc-accent)]">Program</span>
        </div>

        <div className="space-y-3 p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--dc-accent)]">Dancecard</p>
          <h3 className="font-serif text-lg leading-tight">Opening circle · 10:00 AM</h3>
          <p className="text-sm text-[var(--dc-muted)]">
            Body copy at 14px — readable in sunlight? Muted secondary line for room and presenter.
          </p>

          <div className="rounded-lg border border-[var(--dc-border-subtle)] bg-[var(--dc-elevated-solid)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dc-muted)]">Your schedule</p>
            <p className="mt-1 text-sm">Rope 101 · Classroom 1 · 2:00 PM</p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--dc-accent) 0%, var(--dc-accent-hover) 100%)',
                color: 'var(--dc-accent-foreground)',
              }}
            >
              Open my dancecard
            </button>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--dc-muted)]">Compare strip</p>
            <div className="flex gap-0.5 rounded-md border border-[var(--dc-border-subtle)] p-1">
              {[
                { bg: outside, title: 'Outside' },
                { bg: preset.vars['--dc-compare-mutual'], title: 'Mutual' },
                { bg: preset.vars['--dc-compare-host-only'], title: 'Host' },
                { bg: preset.vars['--dc-compare-busy'], title: 'Busy' },
              ].map((cell) => (
                <div
                  key={cell.title}
                  className="h-8 min-w-[12px] flex-1 rounded-sm"
                  style={{ backgroundColor: cell.bg }}
                  title={cell.title}
                />
              ))}
            </div>
          </div>
        </div>

        <nav className="flex border-t border-[var(--dc-border-subtle)] bg-[var(--dc-surface-muted)] text-[10px] font-semibold">
          {['Program', 'Avail', 'Compare', 'Reserve'].map((tab, i) => (
            <span
              key={tab}
              className="flex flex-1 flex-col items-center py-2"
              style={{
                color: i === 0 ? 'var(--dc-accent)' : 'var(--dc-muted)',
                backgroundColor: i === 0 ? 'var(--dc-accent-muted)' : 'transparent',
              }}
            >
              {tab}
            </span>
          ))}
        </nav>
      </div>
    </section>
  )
}

export default function DancecardPaletteLabPage() {
  return (
    <div className="min-h-screen bg-[#0a0908] px-4 py-8 text-[#f7f3eb] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/dancecard" className="text-sm text-[#c6a75e] hover:underline">
          ← Back to Dancecard
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-bold">Palette lab</h1>
        <p className="mt-2 text-sm text-[#9a9288]">
          Compare themes for outdoor / mobile readability. Scroll on your phone in bright light — tap a chip to jump.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Jump to palette">
          {PALETTE_PRESETS.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-[#f7f3eb] hover:border-[#c6a75e]/50 hover:bg-[#c6a75e]/10"
            >
              {p.name.split('—')[0]?.trim() ?? p.name}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-10">
          {PALETTE_PRESETS.map((preset) => (
            <PaletteMock key={preset.id} preset={preset} />
          ))}
        </div>
      </div>
    </div>
  )
}
