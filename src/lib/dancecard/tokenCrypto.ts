import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

function getKey(): Buffer {
  const k = process.env.DANCECARD_TOKEN_ENCRYPT_KEY
  if (!k || k.length < 16) {
    throw new Error('DANCECARD_TOKEN_ENCRYPT_KEY must be set (min 16 chars) for Google Sheets token storage')
  }
  return createHash('sha256').update(k, 'utf8').digest()
}

/** AES-256-GCM; returns base64(iv+ciphertext+tag). */
export function encryptSecret(plain: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()])
  const tag = c.getAuthTag()
  return Buffer.concat([iv, enc, tag]).toString('base64')
}

export function decryptSecret(b64: string): string {
  const key = getKey()
  const buf = Buffer.from(b64, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(buf.length - 16)
  const enc = buf.subarray(12, buf.length - 16)
  const d = createDecipheriv('aes-256-gcm', key, iv)
  d.setAuthTag(tag)
  return Buffer.concat([d.update(enc), d.final()]).toString('utf8')
}
