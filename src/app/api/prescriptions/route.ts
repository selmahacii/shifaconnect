import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate prescription number
function generatePrescriptionNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// GET /api/prescriptions - List prescriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Filters
    const patientId = searchParams.get('patientId')
    const doctorId = searchParams.get('doctorId')
    const startDate = searchParams.get('startDate') // DD/MM/YYYY format
    const endDate = searchParams.get('endDate') // DD/MM/YYYY format
    const search = searchParams.get('search')
    const isValid = searchParams.get('isValid')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (patientId) {
      where.patientId = patientId
    }

    if (doctorId) {
      where.doctorId = doctorId
    }

    // Date range filter
    if (startDate && endDate) {
      // For simplicity, filter by date string comparison
      // In production, you might want to parse dates properly
      where.prescriptionDate = {
        gte: startDate,
        lte: endDate,
      }
    } else if (startDate) {
      where.prescriptionDate = startDate
    }

    if (isValid !== null && isValid !== undefined) {
      where.isValid = isValid === 'true'
    }

    if (search) {
      where.OR = [
        { diagnosis: { contains: search } },
        { prescriptionNumber: { contains: search } },
        { patient: { firstName: { contains: search } } },
        { patient: { lastName: { contains: search } } },
        { patient: { fileNumber: { contains: search } } },
        { items: { some: { medicationName: { contains: search } } } },
      ]
    }

    // Get total count
    const total = await db.prescription.count({ where })

    // Get prescriptions with relations
    const prescriptions = await db.prescription.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            firstNameAr: true,
            lastNameAr: true,
            fileNumber: true,
            dateOfBirth: true,
            gender: true,
            chifaNumber: true,
          },
        },
        doctor: {
          select: {
            id: true,
            professionalTitle: true,
            specialization: true,
            licenseNumber: true,
            clinicName: true,
            address: true,
            city: true,
            clinicPhone: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        consultation: {
          select: {
            id: true,
            consultationDate: true,
            consultationTime: true,
            chiefComplaint: true,
            diagnosis: true,
          },
        },
        items: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    // Calculate stats if requested
    let stats = null
    const includeStats = searchParams.get('stats') === 'true'
    
    if (includeStats) {
      const today = new Date()
      const monthStart = `01/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
      const monthEnd = `${new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

      const [totalMonth, validCount, voidedCount] = await Promise.all([
        // This month's prescriptions
        db.prescription.count({
          where: {
            prescriptionDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        // Valid prescriptions count
        db.prescription.count({
          where: { isValid: true },
        }),
        // Voided prescriptions count
        db.prescription.count({
          where: { isValid: false },
        }),
      ])

      stats = {
        totalMonth,
        validCount,
        voidedCount,
      }
    }

    return NextResponse.json({
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ordonnances' },
      { status: 500 }
    )
  }
}

// POST /api/prescriptions - Create prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      patientId,
      doctorId,
      consultationId,
      prescriptionDate,
      diagnosis,
      generalInstructions,
      notes,
      medications,
    } = body

    // Validate required fields
    if (!patientId) {
      return NextResponse.json(
        { error: 'Le patient est requis' },
        { status: 400 }
      )
    }

    if (!prescriptionDate) {
      return NextResponse.json(
        { error: 'La date est requise' },
        { status: 400 }
      )
    }

    if (!medications || medications.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un médicament est requis' },
        { status: 400 }
      )
    }

    if (medications.length > 10) {
      return NextResponse.json(
        { error: 'Le nombre maximum de médicaments est de 10' },
        { status: 400 }
      )
    }

    // Get first available doctor if not provided
    let doctorIdToUse = doctorId
    if (!doctorIdToUse) {
      const firstDoctor = await db.doctor.findFirst()
      if (firstDoctor) {
        doctorIdToUse = firstDoctor.id
      } else {
        return NextResponse.json(
          { error: 'Aucun médecin disponible' },
          { status: 400 }
        )
      }
    }

    // Generate prescription number
    const prescriptionNumber = generatePrescriptionNumber()

    // Create prescription with items
    const prescription = await db.prescription.create({
      data: {
        patientId,
        doctorId: doctorIdToUse,
        consultationId: consultationId || null,
        prescriptionNumber,
        prescriptionDate,
        diagnosis: diagnosis || null,
        generalInstructions: generalInstructions || null,
        notes: notes || null,
        items: {
          create: medications.map((med: Record<string, unknown>, index: number) => ({
            medicationName: med.medicationName as string,
            medicationNameAr: (med.medicationNameAr as string) || null,
            dosage: med.dosage as string,
            form: (med.form as string) || null,
            frequency: med.frequency as string,
            frequencyAr: (med.frequencyAr as string) || null,
            duration: med.duration as string,
            durationAr: (med.durationAr as string) || null,
            quantity: (med.quantity as string) || null,
            instructions: (med.instructions as string) || null,
            instructionsAr: (med.instructionsAr as string) || null,
            renewal: (med.renewal as boolean) || false,
            order: index,
          })),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            firstNameAr: true,
            lastNameAr: true,
            fileNumber: true,
            dateOfBirth: true,
            gender: true,
            chifaNumber: true,
          },
        },
        doctor: {
          select: {
            id: true,
            professionalTitle: true,
            specialization: true,
            licenseNumber: true,
            clinicName: true,
            address: true,
            city: true,
            clinicPhone: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        items: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'ordonnance' },
      { status: 500 }
    )
  }
}
