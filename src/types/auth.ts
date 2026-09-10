export type OrgSignupRequest = {
  organizationName: string
  email: string
  website?: string
  username: string
  password: string
}

export type OrgLoginRequest = {
  username: string
  password: string
}

export type OrgSessionResponse = {
  ok: true
  organizationId: string
  organizationName: string
  organizationSlug: string
  username: string | null
}
