export default function HomeHeroMinimal() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-black via-[#070b10] to-black pt-6 pb-5 md:pt-10 md:pb-7"
      aria-labelledby="home-hero-title"
    >
      <div className="home-ambient -right-24 top-0 h-64 w-64 bg-primary-600/25 opacity-60" aria-hidden />
      <div className="home-ambient bottom-0 left-[-4rem] h-48 w-48 bg-cyan-600/20 opacity-50" aria-hidden />

      <div className="container-custom relative z-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary-400/90">
          All 50 states · Nationwide listings
        </p>
        <h1
          id="home-hero-title"
          className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[2.5rem]"
        >
          Upcoming{' '}
          <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-cyan-300 bg-clip-text text-transparent">
            kink events
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-300">
          Conventions, parties, and weekends—browse by date, state, or calendar.
        </p>
      </div>
    </section>
  )
}
