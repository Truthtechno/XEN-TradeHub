import { NextRequest } from 'next/server'
import { simpleLogin } from '@/lib/simple-auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function POST(request: NextRequest) {
  return simpleLogin(request)
}
