import Image from 'next/image'
import Link from 'next/link'
import type { SiteSponsorPromo } from '@/data/siteSponsor'

type Variant = 'compact' | 'wide'

type Props = {
  promo: SiteSponsorPromo
  variant?: Variant
}

export default function KinkSocialAlphaSponsorCard({ promo, variant = 'compact' }: Props) {
  const isWide = variant === 'wide'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-teal-400/45 bg-gradient-to-br from-black via-slate-950 to-teal-950/40 kink-social-alpha-sponsor ${
        isWide ? 'p-5 sm:p-6' : 'p-3 sm:p-4'
      }`}
    >
      <span className="kink-social-alpha-badge">Alpha test</span>

      <div className={`relative z-[1] flex flex-col ${isWide ? 'gap-5' : 'gap-3'}`}>
        <div
          className={`relative overflow-hidden rounded-xl border border-amber-300/35 bg-black shadow-[0_0_40px_rgba(234,179,8,0.15)] ${
            isWide ? 'aspect-[16/9] sm:aspect-[2.2/1]' : 'aspect-[16/10]'
          }`}
        >
          <Image
            src={promo.imageUrl}
            alt={promo.imageAlt}
            fill
            className="object-cover object-center"
            sizes={isWide ? '(max-width: 768px) 100vw, 640px' : '(max-width: 768px) 100vw, 340px'}
            priority={isWide}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/90 sm:text-xs">
              {promo.eyebrow}
            </p>
            <p className="font-serif text-lg font-semibold text-white sm:text-xl">{promo.name}</p>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-teal-300/90">{promo.eyebrow}</p>
          <h3 className={`font-serif font-semibold text-white mt-1 ${isWide ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg'}`}>
            {promo.headline}
          </h3>
          <p className={`text-gray-200 mt-2 leading-relaxed ${isWide ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
            {promo.tagline}
          </p>
          <p className={`text-gray-400 mt-2 ${isWide ? 'text-xs' : 'text-[10px] sm:text-xs'}`}>
            Community platform for organizers, educators, and members — now in alpha on kink.social.
          </p>
          <div className={`mt-4 flex flex-col gap-2 ${isWide ? 'sm:flex-row sm:flex-wrap' : ''}`}>
            <a
              href={promo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="kink-social-alpha-cta inline-flex min-h-touch items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-black sm:text-sm"
            >
              {promo.ctaLabel}
            </a>
            <Link
              href="/education/kink-social-alpha-testing"
              className="btn-outline px-4 py-2.5 text-xs min-h-touch inline-flex items-center justify-center sm:text-sm"
            >
              Read the launch article
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
