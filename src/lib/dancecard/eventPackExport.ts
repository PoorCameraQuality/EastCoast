import type { SupabaseClient } from '@supabase/supabase-js'
import archiver from 'archiver'
import { PassThrough } from 'stream'

export async function buildEventPackZip(
  admin: SupabaseClient,
  eventId: string,
  eventSlug: string,
  files: Array<{ name: string; content: string | Buffer }>,
): Promise<Buffer> {
  void admin
  void eventId
  void eventSlug
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const stream = new PassThrough()
    const chunks: Buffer[] = []
    stream.on('data', (c) => chunks.push(c as Buffer))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
    archive.on('error', reject)
    archive.pipe(stream)
    for (const f of files) {
      archive.append(f.content, { name: f.name })
    }
    void archive.finalize()
  })
}
