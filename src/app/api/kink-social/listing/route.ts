import type { NextRequest } from 'next/server'
import { handleKinkSocialListingWebhook } from '@/lib/kinkSocialListingIngest'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return handleKinkSocialListingWebhook(request)
}
