import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PatientCreateSchema, validateFormData } from '@/lib/validations/schemas';
import { PAGINATION } from '@/lib/utils';
import { logAction, AuditAction } from '@/lib/audit';

// GET /api/patients - List patients with search, filter, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(PAGINATION.defaultPageSize), 10),
      100
    );
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search')?.trim() || '';
    const gender = searchParams.get('gender');
    const wilaya = searchParams.get('wilaya');
    const bloodType = searchParams.get('bloodType');
    const isActive = searchParams.get('isActive');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder')?.toUpperCase() === 'ASC' ? 'asc' : 'desc';

    // Build where clause
    const where: Record<string, unknown> = {};

    // Search filter (name, phone, file number, NIN, Chifa)
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { firstNameAr: { contains: search } },
        { lastNameAr: { contains: search } },
        { phone: { contains: search } },
        { phoneSecondary: { contains: search } },
        { fileNumber: { contains: search } },
        { nin: { contains: search } },
        { chifaNumber: { contains: search } },
      ];
    }

    // Gender filter
    if (gender && ['MALE', 'FEMALE'].includes(gender)) {
      where.gender = gender;
    }

    // Wilaya filter
    if (wilaya) {
      where.wilaya = wilaya;
    }

    // Blood type filter
    if (bloodType) {
      where.bloodType = bloodType;
    }

    // Active status filter
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    if (sortBy === 'name') {
      orderBy.lastName = sortOrder;
      orderBy.firstName = sortOrder;
    } else if (sortBy === 'date') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'lastVisit') {
      orderBy.createdAt = 'desc'; // Default for now
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get total count
    const total = await db.patient.count({ where });

    // Get patients with last consultation info
    const patients = await db.patient.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        fileNumber: true,
        firstName: true,
        lastName: true,
        firstNameAr: true,
        lastNameAr: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        phoneSecondary: true,
        email: true,
        address: true,
        city: true,
        wilaya: true,
        bloodType: true,
        nin: true,
        chifaNumber: true,
        allergies: true,
        chronicDiseases: true,
        currentMedications: true,
        isActive: true,
        createdAt: true,
        consultations: {
          take: 1,
          orderBy: { consultationDate: 'desc' },
          select: {
            consultationDate: true,
            chiefComplaint: true,
          },
        },
      },
    });

    // Transform to include last consultation
    const patientsWithLastVisit = patients.map(p => ({
      ...p,
      lastConsultation: p.consultations?.[0] || null,
      consultations: undefined,
    }));

    return NextResponse.json({
      patients: patientsWithLastVisit,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateFormData(PatientCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', errors: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate file number (Format: P-YYYY-NNNNN)
    const currentYear = new Date().getFullYear();
    const lastPatient = await db.patient.findFirst({
      where: {
        fileNumber: {
          startsWith: `P-${currentYear}`,
        },
      },
      orderBy: { fileNumber: 'desc' },
    });

    let fileNumber: string;
    if (lastPatient && lastPatient.fileNumber) {
      const lastNumber = parseInt(lastPatient.fileNumber.split('-')[2], 10);
      fileNumber = `P-${currentYear}-${String(lastNumber + 1).padStart(5, '0')}`;
    } else {
      fileNumber = `P-${currentYear}-00001`;
    }

    // Get doctor ID from session or first doctor
    let doctorId: string;
    const doctor = await db.doctor.findFirst();
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Aucun médecin trouvé. Veuillez créer un profil médecin.' },
        { status: 400 }
      );
    }
    doctorId = doctor.id;

    // Create patient
    const patient = await db.patient.create({
      data: {
        doctorId,
        fileNumber,
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
        isActive: true,
      },
    });
    
    // Log audit action
    await logAction({
      action: AuditAction.CREATE,
      entityType: 'PATIENT',
      entityId: patient.id,
      newValue: patient,
    });

    return NextResponse.json({ 
      success: true, 
      data: patient 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du patient' },
      { status: 500 }
    );
  }
}
