import { NextRequest } from 'next/server'
import { simpleAuthCheck } from '@/lib/simple-auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'





export async function GET(request: NextRequest) {
  return simpleAuthCheck(request)
}
