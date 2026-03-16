import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/debug/doctor - Get current doctor profile
export async function GET(): Promise<NextResponse> {
  try {
    // Get first doctor with user info
    const doctor = await db.doctor.findFirst({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    if (!doctor) {
      return NextResponse.json({
        doctor: null,
        message: 'Aucun profil médecin trouvé',
      })
    }

    return NextResponse.json({
      doctor: {
        id: doctor.id,
        userId: doctor.userId,
        professionalTitle: doctor.professionalTitle,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        clinicName: doctor.clinicName,
        address: doctor.address,
        city: doctor.city,
        wilaya: doctor.wilaya,
        consultationFee: doctor.consultationFee,
        user: doctor.user,
      },
      message: 'Profil médecin récupéré avec succès',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        doctor: null,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
