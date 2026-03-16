import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/debug/user - Get current user info
export async function GET(): Promise<NextResponse> {
  try {
    // Get first user (in production, this would use session)
    const user = await db.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        user: null,
        message: 'Aucun utilisateur trouvé',
      })
    }

    return NextResponse.json({
      user,
      message: 'Utilisateur récupéré avec succès',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        user: null,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
