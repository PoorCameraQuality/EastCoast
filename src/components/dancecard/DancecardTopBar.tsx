'use client'

import Link from 'next/link'

export function DancecardTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/80 bg-[#07101f]/95 shadow-[0_10px_30px_rgba(2,6,23,0.32)] backdrop-blur">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-3 px-4 sm:h-12 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-slate-100 transition hover:text-white">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 via-teal-400 to-violet-500 text-[10px] font-serif font-bold text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.22)] sm:h-8 sm:w-8 sm:text-xs">
            EC
          </span>
          <span className="truncate text-sm font-semibold text-slate-100">East Coast Kink Events</span>
        </Link>
        <Link
          href="/"
          className="shrink-0 text-xs font-semibold text-cyan-100 underline-offset-4 hover:text-white hover:underline"
        >
          DANCECARD BETA
        </Link>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-slate-700/60 px-4 py-1.5 text-[10px] leading-snug text-slate-400 sm:px-6 lg:px-8">
        <Link href="/privacy" className="text-slate-300/85 underline-offset-2 hover:text-white hover:underline">
          Privacy policy
        </Link>
        <span className="text-slate-600" aria-hidden>
          ·
        </span>
        <Link href="/contact" className="text-slate-300/85 underline-offset-2 hover:text-white hover:underline">
          Data export / deletion requests
        </Link>
        <span className="hidden text-slate-600 sm:inline">— we respond by email.</span>
      </div>
    </header>
  )
}
