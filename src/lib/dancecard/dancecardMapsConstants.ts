/** Supabase Storage bucket for floor / camp maps (create in dashboard + public read or signed URLs). */
export const DANCECARD_MAPS_BUCKET = process.env.DANCECARD_MAPS_BUCKET ?? 'dancecard-maps'

export function sanitizeMapObjectName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'map.bin'
}
