import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requis' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cette adresse, vous recevrez un email.',
      })
    }

    // In a real application, you would:
    // 1. Generate a password reset token
    // 2. Store it in the database with an expiration
    // 3. Send an email with a reset link

    // For now, we'll just return success
    // TODO: Implement email sending with a service like SendGrid, Mailgun, etc.

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cette adresse, vous recevrez un email de réinitialisation.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
