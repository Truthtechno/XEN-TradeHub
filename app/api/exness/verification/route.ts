import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'







export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, accountType, exnessAccountId } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Save the verification request to your database
    // 2. Send a confirmation email
    // 3. Add user to a verification queue
    // 4. Log the interaction for analytics

    // For now, we'll simulate a successful response
    const verificationId = `corefx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate database save
    console.log('Verification request received:', {
      verificationId,
      email,
      accountType,
      exnessAccountId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      verificationId,
      message: 'Verification request submitted successfully. You will receive an email confirmation shortly.',
      nextSteps: [
        'Check your email for verification instructions',
        'Complete your Exness account setup if you haven\'t already',
        'Join our Telegram group using the link provided in the email',
        'Start receiving daily trading signals'
      ]
    })

  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const verificationId = searchParams.get('id')

    if (!verificationId) {
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Query your database for the verification status
    // 2. Return the current status

    // For now, we'll simulate a verification status
    return NextResponse.json({
      verificationId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      estimatedProcessingTime: '24 hours'
    })

  } catch (error) {
    console.error('Verification status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
