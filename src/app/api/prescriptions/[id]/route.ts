import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/prescriptions/[id] - Get single prescription
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const prescription = await db.prescription.findUnique({
      where: { id },
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
            phone: true,
            email: true,
            address: true,
            city: true,
            bloodType: true,
            allergies: true,
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
            icdCode: true,
          },
        },
        items: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!prescription) {
      return NextResponse.json(
        { error: 'Ordonnance non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Error fetching prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'ordonnance' },
      { status: 500 }
    )
  }
}

// PUT /api/prescriptions/[id] - Update prescription
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      prescriptionDate,
      diagnosis,
      generalInstructions,
      notes,
      medications,
    } = body

    // Check if prescription exists
    const existingPrescription = await db.prescription.findUnique({
      where: { id },
    })

    if (!existingPrescription) {
      return NextResponse.json(
        { error: 'Ordonnance non trouvée' },
        { status: 404 }
      )
    }

    // Update prescription in a transaction
    const prescription = await db.$transaction(async (tx) => {
      // Update prescription fields
      const updated = await tx.prescription.update({
        where: { id },
        data: {
          prescriptionDate: prescriptionDate || existingPrescription.prescriptionDate,
          diagnosis: diagnosis !== undefined ? diagnosis : existingPrescription.diagnosis,
          generalInstructions: generalInstructions !== undefined ? generalInstructions : existingPrescription.generalInstructions,
          notes: notes !== undefined ? notes : existingPrescription.notes,
        },
      })

      // If medications provided, delete existing and create new ones
      if (medications && Array.isArray(medications)) {
        await tx.prescriptionItem.deleteMany({
          where: { prescriptionId: id },
        })

        await tx.prescriptionItem.createMany({
          data: medications.map((med: Record<string, unknown>, index: number) => ({
            prescriptionId: id,
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
        })
      }

      // Return updated prescription with relations
      return tx.prescription.findUnique({
        where: { id },
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
              clinicPhone: true,
              address: true,
              city: true,
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
    })

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Error updating prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'ordonnance' },
      { status: 500 }
    )
  }
}

// DELETE /api/prescriptions/[id] - Void prescription (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    // Check if prescription exists
    const existingPrescription = await db.prescription.findUnique({
      where: { id },
    })

    if (!existingPrescription) {
      return NextResponse.json(
        { error: 'Ordonnance non trouvée' },
        { status: 404 }
      )
    }

    // Void the prescription instead of deleting
    await db.prescription.update({
      where: { id },
      data: {
        isValid: false,
      },
    })

    return NextResponse.json({
      message: 'Ordonnance annulée avec succès',
    })
  } catch (error) {
    console.error('Error voiding prescription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'ordonnance' },
      { status: 500 }
    )
  }
}
