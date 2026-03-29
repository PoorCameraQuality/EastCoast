/**
 * Pull listing logos from official sites (og:image, or direct WP/site-logo URLs).
 * Re-run when CDN signed URLs expire (Arcadia) or after rebrands.
 *
 *   node scripts/fetch-listing-logos.mjs
 *
 * If `fetch()` fails for a host (TLS/DNS), fallbacks use static asset URLs from HTML.
 */
import { execFileSync } from 'child_process'
import { writeFileSync, mkdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'images')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'

function curlText(url) {
  const curl = process.platform === 'win32' ? 'curl.exe' : 'curl'
  return execFileSync(curl, ['-fsSL', '-L', '-A', UA, url], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`${url} -> ${res.status}`)
    return res.text()
  } catch (e) {
    console.warn('fetch HTML failed, curl fallback:', url, e.message)
    return curlText(url)
  }
}

function downloadViaCurl(url, dest) {
  const curl = process.platform === 'win32' ? 'curl.exe' : 'curl'
  execFileSync(curl, ['-fsSL', '-L', '-A', UA, '-o', dest, url], {
    stdio: 'inherit',
  })
  const n = statSync(dest).size
  if (n < 100) throw new Error(`img too small ${n}`)
  console.log('OK', dest, n, '(curl)')
}

async function downloadBinary(url, dest) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`img ${url} -> ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) throw new Error(`img too small ${buf.length}`)
    writeFileSync(dest, buf)
    console.log('OK', dest, buf.length)
  } catch (e) {
    console.warn('fetch failed, curl fallback:', url, e.message)
    downloadViaCurl(url, dest)
  }
}

function ogImage(html) {
  const m =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)
  return m ? m[1].replace(/&amp;/g, '&') : null
}

const jobs = [
  {
    page: 'https://arcadiacollectivedetroit.org/',
    dest: join(outDir, 'dungeons', 'logo-arcadia-collective.png'),
  },
  {
    page: 'https://visitdiosa.com/',
    direct:
      'https://img1.wsimg.com/isteam/ip/8208212c-e70e-486c-8bfb-9eb393763cc7/favicon/98081f18-02ff-441a-8dcf-f3f722f5be90.jpg/:/rs=w:512,h:512,m',
    dest: join(outDir, 'dungeons', 'logo-diosas-play-space.jpg'),
  },
  {
    page: 'https://subspaceindy.com/',
    direct:
      'https://subspaceindy.com/wp-content/uploads/2024/03/subSPACELogo-1024x207.png',
    dest: join(outDir, 'dungeons', 'logo-subspace-indy.png'),
  },
  {
    page: 'https://fetishfactory.com/florida-fetish-weekend/31year/',
    fallbackPage: 'https://fetishfactory.com/',
    dest: join(outDir, 'events', 'logo-florida-fetish-weekend.jpg'),
  },
  {
    page: 'https://floridapowerexchange.com/',
    direct:
      'https://floridapowerexchange.com/wp-content/uploads/2024/11/Logo-v4.png',
    dest: join(outDir, 'events', 'logo-florida-power-exchange.png'),
  },
  {
    page: 'https://worldbearweekend.com/',
    dest: join(outDir, 'events', 'logo-world-bear-weekend.jpg'),
  },
  {
    page: 'https://elginmunchers.org/',
    dest: join(outDir, 'events', 'logo-annual-kink-expo.jpg'),
  },
  {
    page: 'https://beguiledcon.com/',
    direct: 'https://beguiledcon.com/wp-content/uploads/2024/03/main.png',
    dest: join(outDir, 'events', 'logo-beguiled.png'),
  },
  {
    page: 'https://www.chicagofetishweekend.com/',
    dest: join(outDir, 'events', 'logo-chicago-fetish-weekend.jpg'),
  },
  {
    page: 'https://www.obligerope.org/bdsm-symposium-2026',
    fallbackPage: 'https://www.obligerope.org/',
    dest: join(outDir, 'events', 'logo-boundless-symposium.jpg'),
  },
  {
    page: 'https://lgbtdetroit.org/coldashell',
    fallbackPage: 'https://lgbtdetroit.org/',
    dest: join(outDir, 'events', 'logo-cold-as-hell.jpg'),
  },
  {
    page: 'https://www.oklahomapowerexchange.com/',
    dest: join(outDir, 'dungeons', 'logo-oklahoma-power-exchange-okc.png'),
  },
  {
    page: 'https://inflictionhall.com/',
    dest: join(outDir, 'dungeons', 'logo-infliction-hall-dfw.png'),
  },
  {
    page: 'https://shrineparties.com/',
    dest: join(outDir, 'dungeons', 'logo-shrine-parties.png'),
  },
  {
    page: 'https://pendulum.club/',
    dest: join(outDir, 'dungeons', 'logo-pendulum-club-houston.png'),
  },
  {
    page: 'https://vortexparties.com/',
    dest: join(outDir, 'dungeons', 'logo-vortex-parties.png'),
  },
  {
    page: 'https://portalnola.com/',
    dest: join(outDir, 'dungeons', 'logo-happy-kitten-portal.png'),
  },
  {
    page: 'https://gwnnbash.com/',
    direct:
      'https://gwnnbash.com/wp-content/uploads/2025/09/2026-GWNN-Bash-3-1-scaled.png',
    dest: join(outDir, 'events', 'logo-gwnn-bash-2026.png'),
  },
  {
    page: 'https://austinkinkweekend.com/',
    direct: 'https://austinkinkweekend.com/images/AWK-LOGO-400x278.webp',
    dest: join(outDir, 'events', 'logo-austin-kink-weekend-2026.webp'),
  },
  {
    page:
      'https://sites.google.com/site/okleatherfest/2026-oklahoma-leatherfest',
    dest: join(outDir, 'events', 'logo-oklahoma-leatherfest-2026.png'),
  },
  {
    page: 'https://www.okckinkweekend.com/',
    dest: join(outDir, 'events', 'logo-okc-kink-weekend-2026.png'),
  },
  {
    page:
      'https://www.midamericaconferenceofclubs.org/event/iowa-leather-weekend-2026/',
    direct:
      'https://www.midamericaconferenceofclubs.org/wp-content/uploads/2025/12/c443a1_fac023bda4be41188a67b2ae4b1e2ff2mv2.png.avif',
    dest: join(outDir, 'events', 'logo-iowa-leather-weekend-2026.png'),
  },
  {
    page: 'https://campthornwood.com/',
    dest: join(outDir, 'events', 'logo-camp-thornwood-2026.png'),
  },
  {
    page: 'https://seleatherfest.com/home',
    direct:
      'https://seleatherfest.com/images/sitegraphics/SELF%20logo%202014new%20lg.png',
    dest: join(outDir, 'events', 'logo-southeast-leather-fest-official.png'),
  },
  {
    page: 'https://www.kinkfest.org/home.php',
    direct: 'https://www.kinkfest.org/logo.png',
    dest: join(outDir, 'events', 'logo-kinkfest-2026.png'),
  },
  {
    page: 'https://fetishfactory.com/',
    direct:
      'https://fetishfactory.com/wp-content/uploads/2022/05/F.F.-Logo-Med-White-e1752097388234.png',
    dest: join(outDir, 'events', 'logo-fetish-factory-white.png'),
  },
  {
    page: 'https://www.internationalmrleather.com/',
    direct:
      'https://static.wixstatic.com/media/dc9023_a89e801775f147bfbfd1e467590bc88a~mv2.png/v1/fill/w_400,h_400,al_c,q_85,usm_0.66_1.00_0.01/IMG_3831_PNG.png',
    dest: join(outDir, 'events', 'logo-imlbb-2026.png'),
  },
  {
    page: 'https://leatherreign.org/',
    direct:
      'https://leatherreign.org/wp-content/uploads/2026/03/NWLC-LeatherReign-logo-480x480.png',
    dest: join(outDir, 'events', 'logo-leather-reign-2026.png'),
  },
  {
    page: 'https://www.northwestleathercelebration.com/',
    direct:
      'https://static1.squarespace.com/static/66d8a72434836f0eddc58239/t/66e22024819561631a5adbc4/1726095396280/new+NWLC+Logo.png?format=500w',
    dest: join(outDir, 'events', 'logo-northwest-leather-celebration-2026-b.png'),
  },
  {
    page: 'https://www.leatherleadership.net/',
    direct:
      'https://images.squarespace-cdn.com/content/v1/673284b7764c801b6b6e6115/b4e13145-4b7b-4a83-b1c3-a3cb92e87319/Clear+LLC+Logo.jpg?format=500w',
    dest: join(outDir, 'events', 'logo-leather-leadership-conference-2026-b.jpg'),
  },
  {
    page: 'https://sdbbleather.com/',
    direct:
      'https://sdbbleather.com/wp-content/uploads/2025/01/SD-Bootblack-Leather-Logo.svg',
    dest: join(outDir, 'events', 'logo-san-diego-bootblack-leather-2026-b.svg'),
  },
  {
    page: 'https://www.southplainsleatherfest.com/Registration.html',
    direct: 'https://www.southplainsleatherfest.com/p7Zeitgeist/img/SPLF-logoheader2024.png',
    dest: join(outDir, 'events', 'logo-south-plains-leatherfest-2026.png'),
  },
  {
    page: 'https://beyondvanilla.org/',
    direct: 'https://beyondvanilla.org/wp-content/uploads/1000000571.png',
    dest: join(outDir, 'events', 'logo-beyond-vanilla-35.png'),
  },
  {
    page: 'https://www.rgvbears.org/rgvlw',
    direct:
      'https://static.wixstatic.com/media/d3d593_aa483bd734c245df8cc071eb15b8e24f~mv2.jpg/v1/fill/w_400,h_225,al_c,q_80,usm_0.66_1.00_0.01/d3d593_aa483bd734c245df8cc071eb15b8e24f~mv2.jpg',
    dest: join(outDir, 'events', 'logo-rgv-leather-weekend-2026-b.jpg'),
  },
  {
    page: 'https://www.pnwlc.org/',
    direct:
      'https://www.pnwlc.org/wp-content/uploads/2021/07/PNWLC-logo-green-tent-trees-500x375-1.jpg',
    dest: join(outDir, 'events', 'logo-pnwlc-2026.jpg'),
  },
]

mkdirSync(join(outDir, 'dungeons'), { recursive: true })
mkdirSync(join(outDir, 'events'), { recursive: true })

for (const job of jobs) {
  try {
    let imgUrl = job.direct || null
    if (!imgUrl) {
      let html = await fetchText(job.page)
      imgUrl = ogImage(html)
      if (!imgUrl && job.fallbackPage) {
        html = await fetchText(job.fallbackPage)
        imgUrl = ogImage(html)
      }
    }
    if (!imgUrl) {
      console.error('NO_OG_IMAGE', job.page)
      continue
    }
    await downloadBinary(imgUrl, job.dest)
  } catch (e) {
    console.error('FAIL', job.page, e.message)
  }
}
