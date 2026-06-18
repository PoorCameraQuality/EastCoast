/**
 * Validation self-test for kink.social education ingest (no Supabase required).
 * Usage: npm run verify:kink-social-education-ingest
 */
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
require('ts-node/register/transpile-only')

const { __kinkSocialIngestSelfTest } = require('../src/lib/kinkSocialIngestValidation.ts')
const { __indexNowSelfTest } = require('../src/lib/indexnowEnv.ts')

try {
  __kinkSocialIngestSelfTest()
  __indexNowSelfTest()
} catch (error) {
  console.error(error)
  process.exit(1)
}
