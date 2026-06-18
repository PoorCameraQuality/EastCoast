import type { NextRequest } from 'next/server'
import { handleKinkSocialUnpublish } from '@/lib/kinkSocialIngest'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return handleKinkSocialUnpublish(request)
}
