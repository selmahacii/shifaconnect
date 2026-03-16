import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AppointmentSchema, validateFormData } from '@/lib/validations/schemas';

// GET /api/appointments/[id] - Get appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            firstNameAr: true,
            lastNameAr: true,
            phone: true,
            phoneSecondary: true,
            email: true,
            gender: true,
            dateOfBirth: true,
            fileNumber: true,
            bloodType: true,
            allergies: true,
            chronicDiseases: true,
            address: true,
            city: true,
          },
        },
        doctor: {
          select: {
            id: true,
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
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id] - Update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if appointment exists
    const existingAppointment = await db.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Handle status-only updates (like confirm, cancel)
    if (body.status && Object.keys(body).length === 1) {
      const appointment = await db.appointment.update({
        where: { id },
        data: { status: body.status },
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
      return NextResponse.json(appointment);
    }

    // Validate full update
    const validation = validateFormData(AppointmentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', errors: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for conflicts if time/date changed
    if (
      data.appointmentDate !== existingAppointment.appointmentDate ||
      data.appointmentTime !== existingAppointment.appointmentTime
    ) {
      const conflictingAppointment = await db.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId: existingAppointment.doctorId,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
      });

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'Un rendez-vous existe déjà à cette heure' },
          { status: 400 }
        );
      }
    }

    // Update appointment
    const appointment = await db.appointment.update({
      where: { id },
      data: {
        patientId: data.patientId,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        duration: data.duration,
        reason: data.reason,
        notes: data.notes,
        status: data.status,
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

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if appointment exists
    const existingAppointment = await db.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to CANCELLED
    const appointment = await db.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous annulé avec succès',
      appointment,
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation du rendez-vous' },
      { status: 500 }
    );
  }
}
