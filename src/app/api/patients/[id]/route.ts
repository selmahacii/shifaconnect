import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PatientUpdateSchema, validateFormData } from '@/lib/validations/schemas';

// GET /api/patients/[id] - Get patient by ID with relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        consultations: {
          orderBy: { consultationDate: 'desc' },
          take: 50,
          select: {
            id: true,
            consultationDate: true,
            consultationTime: true,
            chiefComplaint: true,
            diagnosis: true,
            status: true,
            fee: true,
            paid: true,
          },
        },
        prescriptions: {
          orderBy: { prescriptionDate: 'desc' },
          take: 50,
          select: {
            id: true,
            prescriptionDate: true,
            diagnosis: true,
            isValid: true,
            items: {
              select: {
                medicationName: true,
              },
            },
          },
        },
        appointments: {
          orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'desc' }],
          take: 20,
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
            reason: true,
            status: true,
          },
        },
        medicalDocuments: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            title: true,
            documentType: true,
            documentDate: true,
            createdAt: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: patient 
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du patient' },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if patient exists
    const existingPatient = await db.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { success: false, error: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Validate input
    const validation = validateFormData(PatientUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', errors: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update patient
    const patient = await db.patient.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        firstNameAr: data.firstNameAr || null,
        lastNameAr: data.lastNameAr || null,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nin: data.nin || null,
        chifaNumber: data.chifaNumber || null,
        phone: data.phone || null,
        phoneSecondary: data.phoneSecondary || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        wilaya: data.wilaya || null,
        bloodType: data.bloodType || null,
        allergies: data.allergies || null,
        chronicDiseases: data.chronicDiseases || null,
        currentMedications: data.currentMedications || null,
        emergencyContact: data.emergencyContact || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: patient 
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du patient' },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Soft delete patient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if patient exists
    const existingPatient = await db.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { success: false, error: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Soft delete (set isActive to false)
    await db.patient.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Patient désactivé avec succès' 
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du patient' },
      { status: 500 }
    );
  }
}
