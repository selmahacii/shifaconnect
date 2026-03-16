import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/debug/rls - Test RLS policies
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'patients'

    // Get first doctor (simulating authenticated user)
    const doctor = await db.doctor.findFirst()

    if (!doctor) {
      return NextResponse.json({
        canRead: false,
        message: 'Aucun médecin trouvé pour tester les RLS',
      })
    }

    // Test based on type
    if (type === 'appointments') {
      const appointments = await db.appointment.findMany({
        where: { doctorId: doctor.id },
        select: { id: true, appointmentDate: true, status: true },
        take: 5,
      })

      const count = await db.appointment.count({
        where: { doctorId: doctor.id },
      })

      return NextResponse.json({
        canRead: true,
        count,
        sample: appointments,
        doctorId: doctor.id,
        message: `${count} rendez-vous accessibles`,
      })
    }

    if (type === 'consultations') {
      const consultations = await db.consultation.findMany({
        where: { doctorId: doctor.id },
        select: { id: true, consultationDate: true, status: true },
        take: 5,
      })

      const count = await db.consultation.count({
        where: { doctorId: doctor.id },
      })

      return NextResponse.json({
        canRead: true,
        count,
        sample: consultations,
        doctorId: doctor.id,
        message: `${count} consultations accessibles`,
      })
    }

    // Default: test patients
    const patients = await db.patient.findMany({
      where: { doctorId: doctor.id },
      select: { id: true, firstName: true, lastName: true, fileNumber: true },
      take: 5,
    })

    const patientCount = await db.patient.count({
      where: { doctorId: doctor.id },
    })

    return NextResponse.json({
      canRead: true,
      patientCount,
      sample: patients,
      doctorId: doctor.id,
      message: `${patientCount} patients accessibles`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({
      canRead: false,
      error: errorMessage,
      message: 'Erreur lors du test RLS',
    })
  }
}
