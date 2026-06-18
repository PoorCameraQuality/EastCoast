/** When `INDEXNOW_ENABLED=false`, skip IndexNow HTTP submissions. Default: enabled. */
export function isIndexNowSubmissionEnabled(): boolean {
  const raw = process.env.INDEXNOW_ENABLED?.trim().toLowerCase()
  if (raw === 'false' || raw === '0' || raw === 'no') return false
  return true
}

/** Self-test for INDEXNOW_ENABLED guard (no network). */
export function __indexNowSelfTest(): void {
  const prev = process.env.INDEXNOW_ENABLED
  try {
    delete process.env.INDEXNOW_ENABLED
    if (!isIndexNowSubmissionEnabled()) {
      throw new Error('expected default enabled when INDEXNOW_ENABLED unset')
    }
    process.env.INDEXNOW_ENABLED = 'false'
    if (isIndexNowSubmissionEnabled()) {
      throw new Error('expected disabled when INDEXNOW_ENABLED=false')
    }
    process.env.INDEXNOW_ENABLED = 'true'
    if (!isIndexNowSubmissionEnabled()) {
      throw new Error('expected enabled when INDEXNOW_ENABLED=true')
    }
  } finally {
    if (prev === undefined) delete process.env.INDEXNOW_ENABLED
    else process.env.INDEXNOW_ENABLED = prev
  }
}
