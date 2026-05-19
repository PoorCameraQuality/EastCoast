/** Direct Postgres URL for optional transactional updates (DATABASE_URL or DIRECT_URL). */
export function pgDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim() || process.env.DIRECT_URL?.trim()
  return url || null
}

export type PgQueryFn = (text: string, params?: unknown[]) => Promise<{ rowCount: number }>

/** Run `fn` inside BEGIN/COMMIT when `pg` and a database URL are available. Returns null if skipped. */
export async function withPgTransaction<T>(fn: (query: PgQueryFn) => Promise<T>): Promise<T | null> {
  const connectionString = pgDatabaseUrl()
  if (!connectionString) return null

  let pg: typeof import('pg')
  try {
    pg = await import('pg')
  } catch {
    return null
  }

  const client = new pg.default.Client({ connectionString })
  await client.connect()
  try {
    await client.query('BEGIN')
    const query: PgQueryFn = async (text, params) => {
      const res = await client.query(text, params)
      return { rowCount: res.rowCount ?? 0 }
    }
    const result = await fn(query)
    await client.query('COMMIT')
    return result
  } catch (e) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // ignore rollback failure
    }
    throw e
  } finally {
    await client.end()
  }
}
