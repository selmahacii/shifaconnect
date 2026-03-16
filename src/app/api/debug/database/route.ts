import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/debug/database - Test database connection
export async function GET(): Promise<NextResponse> {
  try {
    // Simple query to test database connection
    const userCount = await db.user.count()
    const patientCount = await db.patient.count()
    const consultationCount = await db.consultation.count()

    return NextResponse.json({
      message: 'Connexion à la base de données réussie',
      details: {
        users: userCount,
        patients: patientCount,
        consultations: consultationCount,
        database: 'SQLite',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        message: 'Erreur de connexion à la base de données',
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
