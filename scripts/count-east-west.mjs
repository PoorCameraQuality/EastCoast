import { getAllEvents } from '../src/data/events.js'
import { getAllDungeons } from '../src/data/dungeons.js'

/** Census West Region + West South Central (common “west of Mississippi” expansion scope). */
const WEST = new Set([
  'IA',
  'KS',
  'MN',
  'MO',
  'NE',
  'ND',
  'SD',
  'AR',
  'LA',
  'OK',
  'TX',
  'AZ',
  'CO',
  'ID',
  'MT',
  'NM',
  'NV',
  'UT',
  'WY',
  'AK',
  'CA',
  'HI',
  'OR',
  'WA',
])

const CONVENTION_LIKE = new Set([
  'Convention',
  'Conference',
  'Leather Event',
  'Contest Weekend',
  'Weekend Event',
])

const ev = getAllEvents()
const dg = getAllDungeons()
const isW = (s) => WEST.has(s)

const eventsEast = ev.filter((e) => !isW(e.location.state)).length
const eventsWest = ev.filter((e) => isW(e.location.state)).length

const convEast = ev.filter(
  (e) => !isW(e.location.state) && CONVENTION_LIKE.has(e.category)
).length
const convWest = ev.filter(
  (e) => isW(e.location.state) && CONVENTION_LIKE.has(e.category)
).length

const dunEast = dg.filter((d) => !isW(d.location.state)).length
const dunWest = dg.filter((d) => isW(d.location.state)).length

console.log(
  JSON.stringify(
    {
      definition:
        'Census West + West South Central (AR,LA,OK,TX): IA,KS,MN,MO,NE,ND,SD, AR,LA,OK,TX, Mountain, Pacific',
      eventsAll: { east: eventsEast, west: eventsWest, total: ev.length },
      eventsConventionLike: {
        east: convEast,
        west: convWest,
        total: convEast + convWest,
        categories: [...CONVENTION_LIKE],
      },
      dungeons: { east: dunEast, west: dunWest, total: dg.length },
    },
    null,
    2
  )
)
