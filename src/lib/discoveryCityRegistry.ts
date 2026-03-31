/** City slug → filter upcoming events where location matches */
export type CityEntry = {
  slug: string
  /** Primary state abbreviation for dungeons / related links */
  stateAbbr: string
  /** Match event.location.city (case-insensitive substring or equality) */
  matchCity: (city: string) => boolean
  displayName: string
}

function m(
  slug: string,
  stateAbbr: string,
  displayName: string,
  needles: string[]
): CityEntry {
  const lower = needles.map((n) => n.toLowerCase())
  return {
    slug,
    stateAbbr,
    displayName,
    matchCity: (city: string) => {
      const c = city.toLowerCase()
      return lower.some((n) => c === n || c.includes(n) || n.includes(c))
    },
  }
}

/** Tier-2 metros + common variants; city-first wins in slug resolution */
export const CITY_BY_SLUG: Record<string, CityEntry> = {
  newark: m('newark', 'NJ', 'Newark', ['newark']),
  'jersey-city': m('jersey-city', 'NJ', 'Jersey City', ['jersey city']),
  trenton: m('trenton', 'NJ', 'Trenton', ['trenton']),
  'atlantic-city': m('atlantic-city', 'NJ', 'Atlantic City', ['atlantic city']),
  philadelphia: m('philadelphia', 'PA', 'Philadelphia', ['philadelphia']),
  pittsburgh: m('pittsburgh', 'PA', 'Pittsburgh', ['pittsburgh']),
  allentown: m('allentown', 'PA', 'Allentown', ['allentown']),
  harrisburg: m('harrisburg', 'PA', 'Harrisburg', ['harrisburg']),
  'new-york-city': m('new-york-city', 'NY', 'New York City', ['new york', 'nyc', 'manhattan']),
  brooklyn: m('brooklyn', 'NY', 'Brooklyn', ['brooklyn']),
  queens: m('queens', 'NY', 'Queens', ['queens']),
  buffalo: m('buffalo', 'NY', 'Buffalo', ['buffalo']),
  rochester: m('rochester', 'NY', 'Rochester', ['rochester']),
  wilmington: m('wilmington', 'DE', 'Wilmington', ['wilmington']),
  dover: m('dover', 'DE', 'Dover', ['dover']),
  baltimore: m('baltimore', 'MD', 'Baltimore', ['baltimore']),
  annapolis: m('annapolis', 'MD', 'Annapolis', ['annapolis']),
  'columbia-md': m('columbia-md', 'MD', 'Columbia', ['columbia']),
  'northern-virginia': m('northern-virginia', 'VA', 'Northern Virginia', [
    'arlington',
    'alexandria',
    'fairfax',
    'falls church',
    'tysons',
    'reston',
    'sterling',
    'northern virginia',
    'nova',
    'dmv',
  ]),
  richmond: m('richmond', 'VA', 'Richmond', ['richmond']),
  'virginia-beach': m('virginia-beach', 'VA', 'Virginia Beach', ['virginia beach']),
  arlington: m('arlington', 'VA', 'Arlington', ['arlington']),
  charlotte: m('charlotte', 'NC', 'Charlotte', ['charlotte']),
  raleigh: m('raleigh', 'NC', 'Raleigh', ['raleigh']),
  durham: m('durham', 'NC', 'Durham', ['durham']),
  greensboro: m('greensboro', 'NC', 'Greensboro', ['greensboro']),
  'charleston': m('charleston', 'SC', 'Charleston', ['charleston']),
  'columbia-sc': m('columbia-sc', 'SC', 'Columbia', ['columbia']),
  atlanta: m('atlanta', 'GA', 'Atlanta', ['atlanta']),
  savannah: m('savannah', 'GA', 'Savannah', ['savannah']),
  miami: m('miami', 'FL', 'Miami', ['miami']),
  orlando: m('orlando', 'FL', 'Orlando', ['orlando']),
  tampa: m('tampa', 'FL', 'Tampa', ['tampa']),
  jacksonville: m('jacksonville', 'FL', 'Jacksonville', ['jacksonville']),
  'fort-lauderdale': m('fort-lauderdale', 'FL', 'Fort Lauderdale', ['fort lauderdale', 'ft lauderdale']),
  'west-palm-beach': m('west-palm-beach', 'FL', 'West Palm Beach', ['west palm']),
  'st-petersburg': m('st-petersburg', 'FL', 'St. Petersburg', ['st. petersburg', 'st petersburg', 'st pete']),
  daytona: m('daytona', 'FL', 'Daytona', ['daytona']),
  toronto: m('toronto', 'ON', 'Toronto', ['toronto']),
  ottawa: m('ottawa', 'ON', 'Ottawa', ['ottawa']),
  hamilton: m('hamilton', 'ON', 'Hamilton', ['hamilton']),
  vancouver: m('vancouver', 'BC', 'Vancouver', ['vancouver']),
  victoria: m('victoria', 'BC', 'Victoria', ['victoria']),
  montreal: m('montreal', 'QC', 'Montreal', ['montreal', 'montréal']),
  'quebec-city': m('quebec-city', 'QC', 'Quebec City', ['quebec city']),
  calgary: m('calgary', 'AB', 'Calgary', ['calgary']),
  edmonton: m('edmonton', 'AB', 'Edmonton', ['edmonton']),
  winnipeg: m('winnipeg', 'MB', 'Winnipeg', ['winnipeg']),
  saskatoon: m('saskatoon', 'SK', 'Saskatoon', ['saskatoon']),
  halifax: m('halifax', 'NS', 'Halifax', ['halifax']),
}

export function isCitySlug(s: string): s is keyof typeof CITY_BY_SLUG {
  return s in CITY_BY_SLUG
}

/** Philadelphia metro cluster for "near Philadelphia" hub */
export const NEAR_PHILADELPHIA_FILTERS: Array<{ state: string; matchCity: (c: string) => boolean }> = [
  { state: 'PA', matchCity: (c) => /philadelphia|philly|king of prussia|west chester|chester|conshohocken/i.test(c) },
  { state: 'NJ', matchCity: (c) => /camden|cherry hill|mount laurel|trenton|gloucester|moorestown/i.test(c) },
  { state: 'DE', matchCity: (c) => /wilmington|newark/i.test(c) },
]

export function cityMatchesPhiladelphiaCluster(city: string, state: string): boolean {
  const row = NEAR_PHILADELPHIA_FILTERS.find((x) => x.state === state)
  return row ? row.matchCity(city) : false
}
