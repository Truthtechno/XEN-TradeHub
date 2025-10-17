import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function POST() {
  const response = NextResponse.json({ success: true })
  // Custom JWT cookie
  response.cookies.delete('auth-token')
  // NextAuth cookies (both dev and prod names)
  response.cookies.delete('next-auth.session-token')
  response.cookies.delete('__Secure-next-auth.session-token')
  response.cookies.delete('next-auth.csrf-token')
  response.cookies.delete('next-auth.callback-url')
  response.cookies.delete('next-auth.state')
  return response
}
