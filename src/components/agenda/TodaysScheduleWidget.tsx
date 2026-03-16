'use client'

import * as React from 'react'
import Link from 'next/link'
import { format, isToday, parse, addMinutes, setHours, setMinutes, isAfter, isBefore, isEqual } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ChevronRight,
  Play,
  Check,
  X,
  MoreVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

// Types
interface Patient {
  id: string
  firstName: string
  lastName: string
  fileNumber: string
  gender: string
}

interface Appointment {
  id: string
  appointmentDate: string // DD/MM/YYYY
  appointmentTime: string // HH:mm
  duration: number
  reason?: string | null
  status: string
  patient?: Patient | null
}

interface TodaysScheduleWidgetProps {
  className?: string
  onStartConsultation?: (patientId: string, appointmentId: string) => void
}

// Status styles
const statusStyles: Record<string, { bg: string; text: string; label: string; indicator: string }> = {
  SCHEDULED: { 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    text: 'text-blue-700 dark:text-blue-400', 
    label: 'Programmé',
    indicator: 'bg-blue-500',
  },
  CONFIRMED: { 
    bg: 'bg-green-50 dark:bg-green-900/20', 
    text: 'text-green-700 dark:text-green-400', 
    label: 'Confirmé',
    indicator: 'bg-green-500',
  },
  IN_PROGRESS: { 
    bg: 'bg-orange-50 dark:bg-orange-900/20', 
    text: 'text-orange-700 dark:text-orange-400', 
    label: 'En cours',
    indicator: 'bg-orange-500',
  },
  COMPLETED: { 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    text: 'text-emerald-700 dark:text-emerald-400', 
    label: 'Terminé',
    indicator: 'bg-emerald-500',
  },
  CANCELLED: { 
    bg: 'bg-gray-50 dark:bg-gray-900/20', 
    text: 'text-gray-700 dark:text-gray-400', 
    label: 'Annulé',
    indicator: 'bg-gray-400',
  },
  NO_SHOW: { 
    bg: 'bg-red-50 dark:bg-red-900/20', 
    text: 'text-red-700 dark:text-red-400', 
    label: 'Absent',
    indicator: 'bg-red-500',
  },
}

// Parse date string DD/MM/YYYY
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

// Parse time string HH:mm to Date (for today)
function parseTimeString(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return setMinutes(setHours(new Date(), hours), minutes)
}

export function TodaysScheduleWidget({ 
  className,
  onStartConsultation,
}: TodaysScheduleWidgetProps) {
  const { toast } = useToast()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentTime, setCurrentTime] = React.useState(new Date())

  // Update current time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch today's appointments
  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true)
        const today = format(new Date(), 'dd/MM/yyyy')
        const response = await fetch(`/api/appointments?date=${today}&limit=20`)
        
        if (!response.ok) throw new Error('Failed to fetch appointments')
        
        const data = await response.json()
        setAppointments(data.appointments || [])
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id ? { ...apt, status: newStatus } : apt
        )
      )

      toast({
        title: 'Statut mis à jour',
        description: `Rendez-vous marqué comme ${statusStyles[newStatus]?.label}`,
      })
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour',
        variant: 'destructive',
      })
    }
  }

  // Handle start consultation
  const handleStartConsultation = async (appointment: Appointment) => {
    if (!appointment.patient) return

    try {
      await handleStatusChange(appointment.id, 'IN_PROGRESS')
      onStartConsultation?.(appointment.patient.id, appointment.id)
    } catch (error) {
      console.error('Error starting consultation:', error)
    }
  }

  // Sort appointments by time
  const sortedAppointments = React.useMemo(() => {
    return [...appointments]
      .filter(apt => apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW')
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
  }, [appointments])

  // Get current and next appointments
  const { currentAppointment, nextAppointment, upcomingAppointments, pastAppointments } = React.useMemo(() => {
    const now = currentTime
    
    const upcoming: Appointment[] = []
    const past: Appointment[] = []
    let current: Appointment | null = null
    let next: Appointment | null = null

    sortedAppointments.forEach(apt => {
      const aptTime = parseTimeString(apt.appointmentTime)
      const aptEndTime = addMinutes(aptTime, apt.duration)

      if (isAfter(now, aptEndTime)) {
        past.push(apt)
      } else if (isBefore(now, aptTime)) {
        upcoming.push(apt)
      } else {
        current = apt
      }
    })

    next = upcoming[0] || null

    return { 
      currentAppointment: current, 
      nextAppointment: next, 
      upcomingAppointments: upcoming.slice(0, 3), 
      pastAppointments: past.slice(-2).reverse(),
    }
  }, [sortedAppointments, currentTime])

  // Stats
  const stats = React.useMemo(() => {
    const scheduled = appointments.filter(a => a.status === 'SCHEDULED').length
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
    const completed = appointments.filter(a => a.status === 'COMPLETED').length
    return { scheduled, confirmed, completed, total: appointments.length }
  }, [appointments])

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Rendez-vous du jour
            </CardTitle>
            <CardDescription>
              {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Programmés:</span>
              <span className="font-medium">{stats.scheduled}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Confirmés:</span>
              <span className="font-medium text-green-600">{stats.confirmed}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : sortedAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun rendez-vous aujourd&apos;hui</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="px-6 pb-4 space-y-3">
              {/* Current Appointment */}
              {currentAppointment && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-orange-600 mb-2 flex items-center gap-1">
                    <span className="animate-pulse h-2 w-2 rounded-full bg-orange-500" />
                    En cours
                  </p>
                  <AppointmentRow
                    appointment={currentAppointment}
                    isCurrent
                    onStartConsultation={handleStartConsultation}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              )}

              {/* Next Appointment */}
              {nextAppointment && !currentAppointment && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-primary mb-2">
                    Prochain rendez-vous
                  </p>
                  <AppointmentRow
                    appointment={nextAppointment}
                    isNext
                    onStartConsultation={handleStartConsultation}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              )}

              {/* Upcoming Appointments */}
              {upcomingAppointments.filter(a => a.id !== nextAppointment?.id).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    À venir ({upcomingAppointments.filter(a => a.id !== nextAppointment?.id).length})
                  </p>
                  <div className="space-y-2">
                    {upcomingAppointments
                      .filter(a => a.id !== nextAppointment?.id)
                      .map(apt => (
                        <AppointmentRow
                          key={apt.id}
                          appointment={apt}
                          onStartConsultation={handleStartConsultation}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Past Appointments */}
              {pastAppointments.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Passés ({pastAppointments.length})
                  </p>
                  <div className="space-y-2 opacity-60">
                    {pastAppointments.map(apt => (
                      <AppointmentRow
                        key={apt.id}
                        appointment={apt}
                        isPast
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// Appointment Row Component
interface AppointmentRowProps {
  appointment: Appointment
  isCurrent?: boolean
  isNext?: boolean
  isPast?: boolean
  onStartConsultation?: (apt: Appointment) => void
  onStatusChange?: (id: string, status: string) => void
}

function AppointmentRow({ 
  appointment, 
  isCurrent, 
  isNext, 
  isPast,
  onStartConsultation,
  onStatusChange,
}: AppointmentRowProps) {
  const status = statusStyles[appointment.status] || statusStyles.SCHEDULED
  const patient = appointment.patient

  return (
    <div className={cn(
      'flex items-center gap-3 p-2 rounded-lg border transition-colors',
      isCurrent && 'border-orange-200 bg-orange-50 dark:bg-orange-900/20',
      isNext && !isCurrent && 'border-primary/30 bg-primary/5',
      isPast && 'border-border/30 bg-muted/30',
      !isCurrent && !isNext && !isPast && 'border-border/50 hover:bg-muted/50',
    )}>
      {/* Status indicator */}
      <div className={cn('w-1 h-10 rounded-full', status.indicator)} />

      {/* Time */}
      <div className="w-14 text-sm font-medium">
        {appointment.appointmentTime}
      </div>

      {/* Patient Info */}
      <div className="flex-1 min-w-0">
        {patient ? (
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0',
              patient.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
            )}>
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {patient.firstName} {patient.lastName}
              </p>
              {appointment.reason && (
                <p className="text-xs text-muted-foreground truncate">
                  {appointment.reason}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">Patient non assigné</span>
        )}
      </div>

      {/* Duration */}
      <div className="text-xs text-muted-foreground">
        {appointment.duration}min
      </div>

      {/* Status Badge & Actions */}
      {!isPast && (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={cn('text-xs', status.bg, status.text)}>
            {status.label}
          </Badge>

          {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {appointment.status === 'SCHEDULED' && (
                  <DropdownMenuItem onClick={() => onStatusChange?.(appointment.id, 'CONFIRMED')}>
                    <Check className="h-4 w-4 mr-2" />
                    Confirmer
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onStartConsultation?.(appointment)}>
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer consultation
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onStatusChange?.(appointment.id, 'CANCELLED')}
                  className="text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {isPast && (
        <Badge variant="outline" className="text-xs">
          {status.label}
        </Badge>
      )}
    </div>
  )
}

export default TodaysScheduleWidget
