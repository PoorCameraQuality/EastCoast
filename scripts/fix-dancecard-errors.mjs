import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiRoot = path.join(root, 'src', 'app', 'api', 'dancecard')

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, acc)
    else if (ent.name === 'route.ts') acc.push(p)
  }
  return acc
}

for (const file of walk(apiRoot)) {
  let s = fs.readFileSync(file, 'utf8')
  if (!/e instanceof Error \? e\.message/.test(s)) continue

  const rel = path.relative(path.join(root, 'src', 'app', 'api'), file).replace(/\\/g, '/')
  const logPrefix = rel.replace(/\/route\.ts$/, '').replace(/\//g, '-')

  if (!s.includes('jsonFromRouteError')) {
    const m = s.match(/import \{([^}]+)\} from '@\/lib\/dancecard\/routeCommon'/)
    if (m) {
      const inner = m[1]
      if (!inner.includes('jsonFromRouteError')) {
        s = s.replace(
          m[0],
          `import {${inner.trim().replace(/,\s*$/, '')}, jsonFromRouteError } from '@/lib/dancecard/routeCommon'`,
        )
      }
    } else {
      s = `import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'\n${s}`
    }
  }

  // Final 500 only when BAD_REQUEST / 403 branches exist
  if (/BAD_REQUEST:|Applications closed/.test(s)) {
    s = s.replace(
      /return NextResponse\.json\(\{ error: msg \}, \{ status: 500 \}\)/g,
      `return jsonFromRouteError(e, '${logPrefix}')`,
    )
  } else {
    s = s.replace(
      /\} catch \(e\) \{\s*const msg = e instanceof Error \? e\.message : '[^']*'\s*return NextResponse\.json\(\{ error: msg \}, \{ status: 500 \}\)\s*\}/g,
      `} catch (e) {\n    return jsonFromRouteError(e, '${logPrefix}')\n  }`,
    )
    s = s.replace(
      /\} catch \(e\) \{\s*return NextResponse\.json\(\{ error: e instanceof Error \? e\.message : '[^']*' \}, \{ status: 500 \}\)\s*\}/g,
      `} catch (e) {\n    return jsonFromRouteError(e, '${logPrefix}')\n  }`,
    )
  }

  fs.writeFileSync(file, s)
  console.log('updated', rel)
}
