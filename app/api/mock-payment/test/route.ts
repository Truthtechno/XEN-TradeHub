import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'




export async function GET() {
  try {


    return NextResponse.json({
      status: 'success',
      message: 'Mock payment system is working',
      timestamp: new Date().toISOString(),
      features: [
        'Payment intent creation',
        'Payment confirmation',
        'Webhook simulation',
        'Test card support',
        'Configurable success rate'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Mock payment system error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      status: 'success',
      message: 'Mock payment test successful',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Mock payment test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
