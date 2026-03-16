import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { db } from '@/lib/db'
import { PrescriptionPDFDocument } from '@/components/prescriptions/PrescriptionPDF'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/prescriptions/[id]/pdf - Generate PDF
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    // Get prescription with all relations
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

    if (!prescription) {
      return NextResponse.json(
        { error: 'Ordonnance non trouvée' },
        { status: 404 }
      )
    }

    // Check if prescription is valid
    if (!prescription.isValid) {
      return NextResponse.json(
        { error: 'Cette ordonnance a été annulée' },
        { status: 400 }
      )
    }

    // Prepare data for PDF
    const doctor = {
      name: prescription.doctor.user.name,
      professionalTitle: prescription.doctor.professionalTitle,
      specialization: prescription.doctor.specialization,
      licenseNumber: prescription.doctor.licenseNumber,
      clinicName: prescription.doctor.clinicName,
      address: prescription.doctor.address,
      city: prescription.doctor.city,
      clinicPhone: prescription.doctor.clinicPhone,
    }

    const patient = {
      firstName: prescription.patient.firstName,
      lastName: prescription.patient.lastName,
      firstNameAr: prescription.patient.firstNameAr,
      lastNameAr: prescription.patient.lastNameAr,
      dateOfBirth: prescription.patient.dateOfBirth,
      gender: prescription.patient.gender,
      fileNumber: prescription.patient.fileNumber,
      chifaNumber: prescription.patient.chifaNumber,
    }

    const medications = prescription.items.map((item) => ({
      medicationName: item.medicationName,
      medicationNameAr: item.medicationNameAr,
      dosage: item.dosage,
      form: item.form,
      frequency: item.frequency,
      frequencyAr: item.frequencyAr,
      duration: item.duration,
      durationAr: item.durationAr,
      quantity: item.quantity,
      instructions: item.instructions,
      instructionsAr: item.instructionsAr,
      renewal: item.renewal,
      order: item.order,
    }))

    // Generate PDF
    const doc = (
      <PrescriptionPDFDocument
        doctor={doctor}
        patient={patient}
        prescriptionDate={prescription.prescriptionDate}
        prescriptionNumber={prescription.prescriptionNumber}
        diagnosis={prescription.diagnosis}
        medications={medications}
        generalInstructions={prescription.generalInstructions}
      />
    )

    const stream = await renderToStream(doc)

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ordonnance-${prescription.patient.lastName}-${prescription.prescriptionDate.replace(/\//g, '-')}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
