import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  return response
}
