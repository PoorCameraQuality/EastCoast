import type { NextRequest } from 'next/server'
import { handleKinkSocialIngest } from '@/lib/kinkSocialIngest'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return handleKinkSocialIngest(request)
}
