/**
 * Validation self-test for kink.social group listing webhook (no Supabase required).
 * Usage: npm run verify:kink-social-listing-webhook
 */
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
require('ts-node/register/transpile-only')

const { __kinkSocialListingSelfTest } = require('../src/lib/kinkSocialListingValidation.ts')

try {
  __kinkSocialListingSelfTest()
} catch (error) {
  console.error(error)
  process.exit(1)
}
