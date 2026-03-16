'use client'

import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parse, startOfWeek, getDay, addDays, isSameDay, setHours, setMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import moment from 'moment'
import { Calendar as BigCalendar, Views, dateFnsLocalizer, type View } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LayoutGrid,
  List,
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { NewAppointmentDialog, type NewAppointmentData } from './NewAppointmentDialog'
import { AppointmentDetailDialog } from './AppointmentDetailDialog'

// Configure localizer with date-fns
const locales = {
  'fr': fr,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

// Types
interface Patient {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  gender: string
  fileNumber: string
}

interface Appointment {
  id: string
  appointmentDate: string // DD/MM/YYYY
  appointmentTime: string // HH:mm
  duration: number
  reason?: string | null
  status: string
  notes?: string | null
  patient?: Patient | null
}

// Calendar event type
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Appointment
}

// Status colors for calendar events
const statusColors: Record<string, string> = {
  SCHEDULED: '#3b82f6', // blue
  CONFIRMED: '#22c55e', // green
  IN_PROGRESS: '#f97316', // orange
  COMPLETED: '#10b981', // emerald
  CANCELLED: '#6b7280', // gray
  NO_SHOW: '#ef4444', // red
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Programmé',
  CONFIRMED: 'Confirmé',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  NO_SHOW: 'Absent',
}

// Parse date string DD/MM/YYYY to Date
function parseDateString(dateStr: string, timeStr?: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number)
  const [hours = 0, minutes = 0] = timeStr ? timeStr.split(':').map(Number) : [0, 0]
  return new Date(year, month - 1, day, hours, minutes)
}

// Convert appointment to calendar event
function appointmentToEvent(appointment: Appointment): CalendarEvent {
  const startDate = parseDateString(appointment.appointmentDate, appointment.appointmentTime)
  const [hours, minutes] = appointment.appointmentTime.split(':').map(Number)
  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + appointment.duration)

  return {
    id: appointment.id,
    title: appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Rendez-vous',
    start: startDate,
    end: endDate,
    resource: appointment,
  }
}

// Custom toolbar component
interface ToolbarProps {
  label: string
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void
  onView: (view: View) => void
  view: View
  views: View[]
}

function CustomToolbar({ label, onNavigate, onView, view, views }: ToolbarProps) {
  const viewLabels: Record<string, string> = {
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onNavigate('PREV')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => onNavigate('TODAY')}>
          Aujourd&apos;hui
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNavigate('NEXT')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold ml-2">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {views.map((v) => (
          <Button
            key={v}
            variant={view === v ? 'default' : 'outline'}
            size="sm"
            onClick={() => onView(v)}
            className={cn(view === v && 'bg-primary text-primary-foreground')}
          >
            {viewLabels[v] || v}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Main calendar component
export function AppointmentCalendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>(Views.WEEK)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{ start: Date; end: Date } | null>(null)

  // Fetch appointments based on current date range
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Calculate date range based on current view
      let startDate: Date
      let endDate: Date
      
      if (currentView === Views.MONTH) {
        startDate = startOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), { weekStartsOn: 1 })
        endDate = addDays(startDate, 42) // 6 weeks
      } else if (currentView === Views.WEEK) {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
        endDate = addDays(startDate, 7)
      } else {
        startDate = new Date(currentDate)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(currentDate)
        endDate.setHours(23, 59, 59, 999)
      }

      const formatDateParam = (d: Date) => format(d, 'dd/MM/yyyy')
      
      const response = await fetch(
        `/api/appointments?startDate=${formatDateParam(startDate)}&endDate=${formatDateParam(endDate)}&limit=200`
      )

      if (!response.ok) throw new Error('Failed to fetch appointments')

      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentDate, currentView])

  React.useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Convert appointments to events
  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map(appointmentToEvent)
  }, [appointments])

  // Handle slot selection (click on empty slot)
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlotInfo({ start, end })
    setIsNewAppointmentOpen(true)
  }, [])

  // Handle event selection (click on existing appointment)
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedAppointment(event.resource)
  }, [])

  // Handle navigate
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate)
  }, [])

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setCurrentView(newView)
  }, [])

  // Create appointment from slot selection
  const handleCreateAppointment = useCallback(async (data: NewAppointmentData) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          appointmentDate: format(selectedSlotInfo?.start || new Date(), 'dd/MM/yyyy'),
          appointmentTime: format(selectedSlotInfo?.start || new Date(), 'HH:mm'),
        }),
      })

      if (!response.ok) throw new Error('Failed to create appointment')

      setIsNewAppointmentOpen(false)
      setSelectedSlotInfo(null)
      fetchAppointments()
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }, [selectedSlotInfo, fetchAppointments])

  // Event style getter
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const backgroundColor = statusColors[event.resource.status] || statusColors.SCHEDULED
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.resource.status === 'CANCELLED' ? 0.5 : 1,
        border: 'none',
        color: 'white',
      },
    }
  }, [])

  // Custom event component
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    const appointment = event.resource
    return (
      <div className="p-1 overflow-hidden">
        <div className="font-medium text-sm truncate">{event.title}</div>
        {appointment.reason && (
          <div className="text-xs opacity-80 truncate">{appointment.reason}</div>
        )}
      </div>
    )
  }, [])

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Calendrier des rendez-vous
            </CardTitle>
            <Button onClick={() => {
              setSelectedSlotInfo({ start: new Date(), end: addDays(new Date(), 0) })
              setIsNewAppointmentOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rendez-vous
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              onView={handleViewChange}
              date={currentDate}
              onNavigate={handleNavigate}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              messages={{
                month: 'Mois',
                week: 'Semaine',
                day: 'Jour',
                today: 'Aujourd\'hui',
                previous: 'Précédent',
                next: 'Suivant',
                noEventsInRange: 'Aucun rendez-vous dans cette période',
                showMore: (total) => `+ ${total} autres`,
              }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar as never,
              }}
              culture="fr"
              step={15}
              timeslots={4}
              min={setMinutes(setHours(new Date(), 8), 0)}
              max={setMinutes(setHours(new Date(), 18), 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={isNewAppointmentOpen}
        onOpenChange={(open) => {
          setIsNewAppointmentOpen(open)
          if (!open) setSelectedSlotInfo(null)
        }}
        defaultValues={selectedSlotInfo ? {
          date: selectedSlotInfo.start,
          time: format(selectedSlotInfo.start, 'HH:mm'),
        } : undefined}
        onSuccess={fetchAppointments}
      />

      {/* Appointment Detail Dialog */}
      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={!!selectedAppointment}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null)
        }}
        onUpdated={fetchAppointments}
        onStartConsultation={(patientId) => {
          router.push(`/consultations/new?patientId=${patientId}`)
        }}
      />
    </>
  )
}

export default AppointmentCalendar
