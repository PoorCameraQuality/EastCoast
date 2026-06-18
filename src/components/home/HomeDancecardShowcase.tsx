import KinkSocialAcquisitionCard from '@/components/kink-social/KinkSocialAcquisitionCard'

export default function HomeDancecardShowcase() {
  return (
    <section
      className="relative border-y border-teal-500/15 bg-gradient-to-b from-[#0a0d12] via-teal-950/15 to-black py-8 md:py-12"
      aria-labelledby="home-kink-social-platform"
    >
      <div className="home-ambient right-0 top-1/2 h-64 w-64 -translate-y-1/2 bg-teal-500/10 opacity-80" aria-hidden />
      <div className="container-custom relative z-10">
        <KinkSocialAcquisitionCard variant="home" className="mx-auto max-w-4xl" />
      </div>
    </section>
  )
}
