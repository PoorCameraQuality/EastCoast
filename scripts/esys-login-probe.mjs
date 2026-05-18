/** One-off probe: discover esys login form fields and test POST. */
const base = 'https://www.event-systems.com/esys/sc25/'

const user = process.argv[2] ?? 'Brax'
const pass = process.argv[3] ?? 'Airship1'

const jar = { cookies: [] }

function parseSetCookie(res) {
  const raw = res.headers.getSetCookie?.() ?? []
  for (const line of raw) {
    const name = line.split('=')[0]
    jar.cookies.push(line.split(';')[0])
  }
}

function cookieHeader() {
  return jar.cookies.join('; ')
}

async function get(url) {
  const res = await fetch(url, {
    headers: { Cookie: cookieHeader() },
    redirect: 'manual',
  })
  parseSetCookie(res)
  const text = await res.text()
  return { res, text }
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieHeader(),
    },
    body: new URLSearchParams(body).toString(),
    redirect: 'manual',
  })
  parseSetCookie(res)
  const text = await res.text()
  return { res, text }
}

const { text: loginHtml } = await get(base)
const inputs = [...loginHtml.matchAll(/<input[^>]*>/gi)].map((m) => m[0])
console.log('INPUTS:', inputs.join('\n'))

const forms = [...loginHtml.matchAll(/<form[^>]*>[\s\S]*?<\/form>/gi)].map((m) => m[0].slice(0, 800))
console.log('\nFORM SNIPPET:\n', forms[0] ?? 'none')

// Try common field name patterns
const attempts = [
  { submittal: 'login', login: user, password: pass, Login: 'Login' },
]

for (const body of attempts) {
  const { res, text } = await post(base, body)
  const failed = /Login Failed/i.test(text)
  const hasLogout = /logout/i.test(text)
  const title = text.match(/<title>([^<]+)/i)?.[1] ?? ''
  console.log('\nPOST', JSON.stringify(body), '→', res.status, title.trim(), failed ? 'FAILED' : hasLogout ? 'maybe ok' : 'unknown')
  if (!failed && (res.status === 302 || hasLogout || !/Login to the/i.test(title))) {
    console.log('SUCCESS CANDIDATE — first 500 chars:\n', text.slice(0, 500))
    // dump links
    const links = [...text.matchAll(/<a[^>]+href="([^"]+)"/gi)].map((m) => m[1])
    console.log('LINKS:', [...new Set(links)].slice(0, 40))
    break
  }
}
