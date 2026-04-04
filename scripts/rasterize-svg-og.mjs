/**
 * Build 1200×630 PNG companions for SVG listing logos (same basename + `-og.png`).
 * Social crawlers (Discord, FB, etc.) often ignore SVG in og:image.
 *
 * Run: node scripts/rasterize-svg-og.mjs
 */
import sharp from 'sharp'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

/** Paths relative to repo root (must exist under public/) */
const SVG_FILES = [
  'public/images/claw-26.svg',
  'public/images/events/brand-event-dc-fetish-ball.svg',
  'public/images/events/brand-event-kinky-con-nh.svg',
  'public/images/events/brand-event-iml.svg',
  'public/images/events/logo-san-diego-bootblack-leather-2026-b.svg',
  'public/images/events/goboundless-logo-light.svg',
  'public/images/dungeons/brand-paddles-nyc.svg',
  'public/images/dungeons/brand-tes-nyc.svg',
  'public/images/dungeons/brand-black-rose-dc.svg',
  'public/images/dungeons/brand-metro-underground-dc.svg',
  'public/images/dungeons/brand-fetish-factory-ftl.svg',
  'public/images/dungeons/brand-nela-new-england.svg',
  'public/images/dungeons/brand-deviance-tampa-bay.svg',
  'public/images/dungeons/brand-galleria-domain-2.svg',
  'public/images/dungeons/brand-the-loftnc.svg',
  'public/images/dungeons/brand-oblige-detroit.svg',
  'public/images/dungeons/brand-academy-fetish-arts-cleveland.svg',
  'public/images/dungeons/brand-the-emporium-kink-haven.svg',
  'public/images/dungeons/brand-chicago-rose-club.svg',
  'public/images/dungeons/brand-lra-chicago.svg',
]

async function rasterizeOne(rel) {
  const inPath = join(root, rel)
  if (!existsSync(inPath)) {
    console.warn('[skip] missing', rel)
    return
  }
  const outPath = inPath.replace(/\.svg$/i, '-og.png')
  try {
    const bg = sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 3,
        background: { r: 10, g: 10, b: 10 },
      },
    })
    const inner = await sharp(inPath)
      .resize(1000, 520, {
        fit: 'inside',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer()
    await bg.composite([{ input: inner, gravity: 'center' }]).png().toFile(outPath)
    console.log('wrote', outPath.replace(root + '\\', '').replace(root + '/', ''))
  } catch (err) {
    console.warn('[fail]', rel, err.message || err)
  }
}

async function main() {
  for (const rel of SVG_FILES) {
    await rasterizeOne(rel)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
