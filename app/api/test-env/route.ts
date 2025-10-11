import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




export async function GET(request: NextRequest) {
  try {


    console.log('Environment variables check:')
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET')
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET')
    
    return NextResponse.json({
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Error checking environment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
