import { createRequire } from 'module'
import path from 'path'
import fs from 'fs'
import vm from 'vm'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const ts = require('typescript')

function loadModuleViaTranspile({ projectRoot, relativeFilePath }) {
  const abs = path.join(projectRoot, relativeFilePath)
  const src = fs.readFileSync(abs, 'utf8')

  const transpiled = ts.transpileModule(src, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
    },
    fileName: abs,
    reportDiagnostics: false,
  }).outputText

  const module = { exports: {} }
  const sandbox = {
    module,
    exports: module.exports,
    require,
    __filename: abs,
    __dirname: path.dirname(abs),
    process,
    console,
  }
  vm.createContext(sandbox)
  new vm.Script(transpiled, { filename: abs }).runInContext(sandbox)
  return module.exports
}

function buildMaps() {
  const tagGroupsById = Object.fromEntries(TAG_GROUPS.map((g) => [g.id, g]))
  const tagsBySlug = Object.fromEntries(TAGS.map((t) => [t.slug, t]))
  return { tagGroupsById, tagsBySlug }
}

function isVisibleTag(tag, tagGroupsById) {
  if (!tag?.isActive) return false
  const g = tagGroupsById[tag.groupId]
  return Boolean(g?.isActive)
}

function filterVendorsByOrTagSlugs(allVendors, selectedTagSlugs) {
  if (!selectedTagSlugs.length) return allVendors
  const set = new Set(selectedTagSlugs)
  return allVendors.filter((v) => (v.tagSlugs || []).some((s) => set.has(s)))
}

function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const { vendors } = loadModuleViaTranspile({ projectRoot, relativeFilePath: 'src/data/vendors.js' })
  const { TAG_GROUPS, TAGS } = loadModuleViaTranspile({ projectRoot, relativeFilePath: 'src/data/vendorTaxonomy.ts' })

  const { tagGroupsById, tagsBySlug } = (() => {
    const tagGroupsById = Object.fromEntries(TAG_GROUPS.map((g) => [g.id, g]))
    const tagsBySlug = Object.fromEntries(TAGS.map((t) => [t.slug, t]))
    return { tagGroupsById, tagsBySlug }
  })()

  const visibleTags = TAGS.filter((t) => isVisibleTag(t, tagGroupsById))

  const unknownTagRefs = []
  for (const v of vendors) {
    for (const slug of v.tagSlugs || []) {
      if (!tagsBySlug[slug]) unknownTagRefs.push({ vendor: v.slug, tag: slug })
    }
  }

  const zeroMatchTags = []
  const tagMatchCounts = []

  for (const t of visibleTags) {
    const matches = filterVendorsByOrTagSlugs(vendors, [t.slug])
    tagMatchCounts.push({ slug: t.slug, name: t.name, count: matches.length })
    if (matches.length === 0) zeroMatchTags.push({ slug: t.slug, name: t.name })
  }

  tagMatchCounts.sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))

  console.log('VENDOR FILTER VERIFICATION')
  console.log('--------------------------')
  console.log(`Vendors: ${vendors.length}`)
  console.log(`Visible tags: ${visibleTags.length}`)
  console.log('')

  if (unknownTagRefs.length) {
    console.log('Unknown tag references found in vendors.js (slug not in vendorTaxonomy):')
    for (const x of unknownTagRefs) console.log(`- vendor=${x.vendor} tag=${x.tag}`)
    console.log('')
  } else {
    console.log('No unknown tag references in vendors.js.')
    console.log('')
  }

  if (zeroMatchTags.length) {
    console.log('Visible tags with ZERO matching vendors (these will look "broken" in UI):')
    for (const z of zeroMatchTags) console.log(`- ${z.slug} (${z.name})`)
    console.log('')
  } else {
    console.log('All visible tags have at least one matching vendor.')
    console.log('')
  }

  console.log('Top 20 tags by vendor count:')
  for (const t of tagMatchCounts.slice(0, 20)) {
    console.log(`- ${t.slug}: ${t.count}`)
  }

  // A few targeted assertions for commonly used tags:
  const sanity = ['chastity-cages', 'pup-play-gear', 'impact-implements', 'handmade-leather']
  console.log('')
  console.log('Sanity checks:')
  for (const slug of sanity) {
    const matches = filterVendorsByOrTagSlugs(vendors, [slug]).map((v) => v.slug).sort()
    console.log(`- ${slug}: ${matches.length} matches`)
  }
}

main()

