const MAX_BYTES = 5 * 1024 * 1024

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp'])

export function sniffProfilePhotoMime(buf: Buffer): string | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png'
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }
  return null
}

export function extensionForProfilePhotoMime(mime: string): string {
  if (mime === 'image/png') return '.png'
  if (mime === 'image/jpeg') return '.jpg'
  return '.webp'
}

export function validateProfilePhotoBuffer(buf: Buffer): { ok: true; mime: string } | { ok: false; error: string } {
  if (buf.length > MAX_BYTES) {
    return { ok: false, error: 'Photo too large (max 5 MB).' }
  }
  const mime = sniffProfilePhotoMime(buf)
  if (!mime || !ALLOWED.has(mime)) {
    return { ok: false, error: 'Use a PNG, JPEG, or WebP image.' }
  }
  return { ok: true, mime }
}
