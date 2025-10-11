import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




export async function GET(request: NextRequest) {
  try {


    console.log('Simple test API - Working!')
    return NextResponse.json({ 
      message: 'Simple test API is working!',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Simple test API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
