import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AppointmentSchema, validateFormData } from '@/lib/validations/schemas';

// GET /api/appointments - List appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const patientId = searchParams.get('patientId') || undefined;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const date = searchParams.get('date') || undefined;
    const search = searchParams.get('search') || undefined;
    const countsOnly = searchParams.get('countsOnly') === 'true';
    const doctorId = searchParams.get('doctorId') || undefined;

    // If countsOnly is true, return appointment counts per day for calendar
    if (countsOnly) {
      const start = startDate || '01/01/2024';
      const end = endDate || '31/12/2025';

      const appointments = await db.appointment.findMany({
        where: {
          appointmentDate: {
            gte: start,
            lte: end,
          },
          ...(doctorId && { doctorId }),
          ...(status && { status: status as 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' }),
        },
        select: {
          appointmentDate: true,
          status: true,
        },
      });

      // Group by date
      const countMap: Record<string, { count: number; confirmed: number; pending: number }> = {};
      appointments.forEach((apt) => {
        if (!countMap[apt.appointmentDate]) {
          countMap[apt.appointmentDate] = { count: 0, confirmed: 0, pending: 0 };
        }
        countMap[apt.appointmentDate].count++;
        if (apt.status === 'CONFIRMED') {
          countMap[apt.appointmentDate].confirmed++;
        } else if (apt.status === 'SCHEDULED') {
          countMap[apt.appointmentDate].pending++;
        }
      });

      const counts = Object.entries(countMap).map(([date, data]) => ({
        date,
        ...data,
      }));

      return NextResponse.json({ counts });
    }

    // Build where clause
    const where: {
      patientId?: string;
      status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
      appointmentDate?: { gte?: string; lte?: string; equals?: string };
      doctorId?: string;
      OR?: Array<{
        patient?: {
          OR: Array<{
            firstName?: { contains: string };
            lastName?: { contains: string };
            phone?: { contains: string };
            fileNumber?: { contains: string };
          }>;
        };
        reason?: { contains: string };
      }>;
    } = {};

    if (patientId) where.patientId = patientId;
    if (status) where.status = status as 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    if (doctorId) where.doctorId = doctorId;

    if (date) {
      where.appointmentDate = { equals: date };
    } else if (startDate || endDate) {
      where.appointmentDate = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      };
    }

    if (search) {
      where.OR = [
        {
          patient: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { phone: { contains: search } },
              { fileNumber: { contains: search } },
            ],
          },
        },
        { reason: { contains: search } },
      ];
    }

    // Get total count
    const total = await db.appointment.count({ where });

    // Get appointments with pagination
    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            gender: true,
            fileNumber: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      appointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateFormData(AppointmentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', errors: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get first doctor (TODO: Get from session)
    const doctor = await db.doctor.findFirst();
    if (!doctor) {
      return NextResponse.json(
        { error: 'Aucun médecin trouvé' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Un rendez-vous existe déjà à cette heure' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: data.patientId,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        duration: data.duration || 15,
        reason: data.reason,
        notes: data.notes,
        status: data.status || 'SCHEDULED',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            gender: true,
            fileNumber: true,
          },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rendez-vous' },
      { status: 500 }
    );
  }
}
