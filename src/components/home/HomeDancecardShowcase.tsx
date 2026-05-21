import { DancecardShowcase } from '@/components/dancecard/DancecardShowcase'

export default function HomeDancecardShowcase() {
  return (
    <section
      className="relative border-y border-amber-500/10 bg-gradient-to-b from-[#0a0d12] via-amber-950/10 to-black py-8 md:py-10"
      aria-labelledby="home-dancecard-showcase"
    >
      <div className="home-ambient right-0 top-1/2 h-64 w-64 -translate-y-1/2 bg-amber-500/15 opacity-80" aria-hidden />
      <div className="container-custom relative z-10">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/90 md:text-left">
          Built for kink weekends
        </p>
        <DancecardShowcase className="mx-auto max-w-3xl md:max-w-none" />
      </div>
    </section>
  )
}
