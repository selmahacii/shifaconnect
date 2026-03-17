
import * as React from 'react'
import { CalendarView } from '@/components/agenda/CalendarView'
import { db } from '@/lib/db'
import { getCurrentDoctorId } from '@/lib/auth/server'
import { startOfMonth, endOfMonth, subDays, addDays, format } from 'date-fns'

async function getAppointments() {
  const doctorId = await getCurrentDoctorId()
  if (!doctorId) return []
  
  // Fetch a range of 2 months for the calendar initial view
  const start = subDays(new Date(), 30)
  const end = addDays(new Date(), 30)

  try {
    const appointments = await db.appointment.findMany({
      where: {
        doctorId,
        // Prisma can handle date strings if stored correctly, 
        // but here schema says appointmentDate is String (DD/MM/YYYY).
        // If we want to filter by range, it's better to store as DateTime.
        // For now, let's fetch more and filter in JS if needed, 
        // or assume the format allows some filtering.
      },
      include: {
        patient: true
      }
    })

    // Map Prisma objects to match what CalendarView expects (snake_case or what was previously used)
    return appointments.map(a => ({
      id: a.id,
      appointment_date: a.appointmentDate,
      appointment_time: a.appointmentTime,
      duration: a.duration,
      reason: a.reason,
      status: a.status,
      patient: a.patient ? {
        id: a.patient.id,
        first_name: a.patient.firstName,
        last_name: a.patient.lastName,
        gender: a.patient.gender,
        phone: a.patient.phone
      } : null
    }))
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
}

export default async function AgendaPage() {
  const appointments = await getAppointments()

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#1B4F72]">Agenda Médical</h1>
        <p className="text-slate-500">Gérez vos rendez-vous et votre emploi du temps</p>
      </div>

      <div className="flex-1">
        <CalendarView initialAppointments={appointments} />
      </div>
    </div>
  )
}
