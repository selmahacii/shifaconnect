import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ConsultationStatus, PaymentMethod } from '@prisma/client'

// GET /api/consultations/[id] - Get consultation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const consultation = await db.consultation.findUnique({
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
            phone: true,
            phoneSecondary: true,
            email: true,
            dateOfBirth: true,
            gender: true,
            bloodType: true,
            allergies: true,
            chronicDiseases: true,
            address: true,
            city: true,
            wilaya: true,
          },
        },
        doctor: {
          select: {
            id: true,
            professionalTitle: true,
            specialization: true,
            clinicName: true,
            clinicPhone: true,
            address: true,
            city: true,
            wilaya: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        prescriptions: {
          select: {
            id: true,
            prescriptionDate: true,
            diagnosis: true,
            notes: true,
            items: {
              select: {
                id: true,
                medicationName: true,
                dosage: true,
                frequency: true,
                duration: true,
                instructions: true,
              },
            },
          },
          orderBy: { prescriptionDate: 'desc' },
        },
      },
    })
    
    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation non trouvée' },
        { status: 404 }
      )
    }
    
    // Get medical documents linked to this consultation
    const medicalDocuments = await db.medicalDocument.findMany({
      where: {
        consultationId: id,
      },
      select: {
        id: true,
        documentType: true,
        title: true,
        documentDate: true,
        description: true,
      },
      orderBy: { documentDate: 'desc' },
    })
    
    // Parse vitals JSON
    const parsedConsultation = {
      ...consultation,
      vitals: consultation.vitals ? JSON.parse(consultation.vitals) : null,
      medicalDocuments,
    }
    
    return NextResponse.json(parsedConsultation)
  } catch (error) {
    console.error('Error fetching consultation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la consultation' },
      { status: 500 }
    )
  }
}

// PUT /api/consultations/[id] - Update consultation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Check if consultation exists
    const existingConsultation = await db.consultation.findUnique({
      where: { id },
    })
    
    if (!existingConsultation) {
      return NextResponse.json(
        { error: 'Consultation non trouvée' },
        { status: 404 }
      )
    }
    
    // Prepare vitals JSON
    const vitalsData = body.vitals ? JSON.stringify(body.vitals) : existingConsultation.vitals
    
    // Update consultation
    const consultation = await db.consultation.update({
      where: { id },
      data: {
        consultationDate: body.consultationDate,
        consultationTime: body.consultationTime,
        chiefComplaint: body.chiefComplaint,
        chiefComplaintAr: body.chiefComplaintAr,
        presentIllness: body.presentIllness,
        presentIllnessAr: body.presentIllnessAr,
        examinationNotes: body.examinationNotes,
        examinationNotesAr: body.examinationNotesAr,
        diagnosis: body.diagnosis,
        diagnosisAr: body.diagnosisAr,
        icdCode: body.icdCode,
        treatmentPlan: body.treatmentPlan,
        treatmentPlanAr: body.treatmentPlanAr,
        followUpDate: body.followUpDate,
        followUpNotes: body.followUpNotes,
        vitals: vitalsData,
        fee: body.fee,
        paid: body.paid,
        paymentMethod: body.paymentMethod as PaymentMethod,
        notes: body.notes,
        status: body.status as ConsultationStatus,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fileNumber: true,
          },
        },
      },
    })
    
    return NextResponse.json(consultation)
  } catch (error) {
    console.error('Error updating consultation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la consultation' },
      { status: 500 }
    )
  }
}

// DELETE /api/consultations/[id] - Delete consultation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if consultation exists
    const existingConsultation = await db.consultation.findUnique({
      where: { id },
      include: {
        prescriptions: true,
        medicalDocuments: true,
      },
    })
    
    if (!existingConsultation) {
      return NextResponse.json(
        { error: 'Consultation non trouvée' },
        { status: 404 }
      )
    }
    
    // Check if consultation has linked prescriptions
    if (existingConsultation.prescriptions.length > 0) {
      return NextResponse.json(
        { error: 'Cette consultation a des ordonnances liées. Veuillez les supprimer d\'abord.' },
        { status: 400 }
      )
    }
    
    // Check if consultation has linked medical documents
    if (existingConsultation.medicalDocuments.length > 0) {
      return NextResponse.json(
        { error: 'Cette consultation a des documents médicaux liés. Veuillez les supprimer d\'abord.' },
        { status: 400 }
      )
    }
    
    // Delete consultation
    await db.consultation.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Consultation supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting consultation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la consultation' },
      { status: 500 }
    )
  }
}
