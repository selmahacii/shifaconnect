
import * as React from 'react'
import { CalendarView } from '@/components/agenda/CalendarView'
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subDays, addDays } from 'date-fns'

async function getAppointments() {
  const supabase = await createClient()
  
  // Fetch a range of 2 months for the calendar initial view
  const start = startOfMonth(subDays(new Date(), 30)).toISOString()
  const end = endOfMonth(addDays(new Date(), 30)).toISOString()

  const { data: appointments, error } = await (supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(*)
    `)
    .gte('appointment_date', start.split('T')[0])
    .lte('appointment_date', end.split('T')[0]) as any)

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return appointments || []
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
