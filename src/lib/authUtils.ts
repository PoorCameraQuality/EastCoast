export function slugifyOrgName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function generateUsername(orgName: string): string {
  return slugifyOrgName(orgName).replace(/-/g, '').slice(0, 30) || 'org'
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}
