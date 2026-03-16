
'use client'

import * as React from 'react'
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Plus, Clock, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppointmentModal } from './AppointmentModal'
import { AppointmentDetailModal } from './AppointmentDetailModal'
import { cn } from '@/lib/utils'

const locales = {
  'fr': fr,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const messages = {
  allDay: 'Toute la journée',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  noEventsInRange: 'Aucun rendez-vous sur cette période',
  showMore: (total: number) => `+ ${total} de plus`,
}

interface CalendarViewProps {
  initialAppointments: any[]
}

export function CalendarView({ initialAppointments }: CalendarViewProps) {
  const [view, setView] = React.useState<View>(Views.WEEK)
  const [date, setDate] = React.useState(new Date())
  const [appointments, setAppointments] = React.useState(initialAppointments)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedSlot, setSelectedSlot] = React.useState<{ start: Date; end: Date } | null>(null)
  const [selectedAppointment, setSelectedAppointment] = React.useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Map events for Big Calendar
  const events = React.useMemo(() => {
    return appointments.map((apt) => {
      const [hours, minutes] = apt.appointment_time.split(':')
      const start = new Date(apt.appointment_date)
      start.setHours(parseInt(hours), parseInt(minutes), 0)
      const end = addMinutes(start, apt.duration || 20)
      
      return {
        id: apt.id,
        title: `${apt.patient.last_name} ${apt.patient.first_name}`,
        start,
        end,
        resource: apt,
      }
    })
  }, [appointments])

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status
    let backgroundColor = '#3174ad'
    
    switch (status) {
      case 'scheduled': backgroundColor = '#3b82f6'; break // Blue
      case 'confirmed': backgroundColor = '#10b981'; break // Green
      case 'cancelled': backgroundColor = '#ef4444'; break // Red
      case 'no-show': backgroundColor = '#6b7280'; break // Gray
      case 'completed': backgroundColor = '#8b5cf6'; break // Purple
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: '500',
        padding: '2px 5px',
      }
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end })
    setIsModalOpen(true)
  }

  const handleSelectEvent = (event: any) => {
    setSelectedAppointment(event.resource)
    setIsDetailOpen(true)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border rounded-md p-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDate(addMinutes(date, - (view === Views.MONTH ? 43200 : view === Views.WEEK ? 10080 : 1440)))} // Simplified navigation
              // Actually better to use date-fns properly for navigation
              onClickCapture={() => {
                 const newDate = new Date(date)
                 if (view === Views.MONTH) newDate.setMonth(date.getMonth() - 1)
                 else if (view === Views.WEEK) newDate.setDate(date.getDate() - 7)
                 else newDate.setDate(date.getDate() - 1)
                 setDate(newDate)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-3 py-1 text-xs font-bold"
              onClick={() => setDate(new Date())}
            >
              AUJOURD'HUI
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClickCapture={() => {
                const newDate = new Date(date)
                if (view === Views.MONTH) newDate.setMonth(date.getMonth() + 1)
                else if (view === Views.WEEK) newDate.setDate(date.getDate() + 7)
                else newDate.setDate(date.getDate() + 1)
                setDate(newDate)
             }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {format(date, 'MMMM yyyy', { locale: fr }).toUpperCase()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['month', 'week', 'day'] as View[]).map((v) => (
              <Button
                key={v}
                variant={view === v ? 'white' : 'ghost'}
                size="sm"
                className={cn(
                  "px-4 text-xs font-bold transition-all",
                  view === v ? "shadow-sm" : "text-slate-500"
                )}
                onClick={() => setView(v)}
              >
                {messages[v as keyof typeof messages]}
              </Button>
            ))}
          </div>
          <Button 
            className="bg-[#1B4F72] hover:bg-[#153e5a]"
            onClick={() => {
              setSelectedSlot(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau RDV
          </Button>
        </div>
      </div>

      <Card className="flex-1 min-h-[700px] border-none shadow-xl overflow-hidden bg-white p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          culture='fr'
          messages={messages}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
          max={new Date(0, 0, 0, 20, 0, 0)} // 8:00 PM
          step={15}
          timeslots={4}
          components={{
            event: CustomEvent,
          }}
        />
      </Card>

      <AppointmentModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedSlot={selectedSlot}
        onSuccess={() => {
          // In a real app, you'd re-fetch here. For now router.refresh() or local update
          window.location.reload()
        }}
      />

      <AppointmentDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        appointment={selectedAppointment}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}

function CustomEvent({ event }: { event: any }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1 font-bold">
        <User className="h-3 w-3 shrink-0" />
        <span className="truncate">{event.title}</span>
      </div>
      <div className="flex items-center gap-1 text-[10px] opacity-80">
        <Clock className="h-2 w-2 shrink-0" />
        <span>{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</span>
      </div>
    </div>
  )
}
