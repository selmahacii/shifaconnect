'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Clock,
  Play,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

export interface TodaysAppointment {
  id: string
  patientId?: string
  patientName: string
  appointmentTime: string
  duration: number
  reason?: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

export interface CurrentConsultation {
  id: string
  patientId: string
  patientName: string
  startTime: string
  chiefComplaint?: string
}

export interface TodaysScheduleProps {
  appointments?: TodaysAppointment[]
  currentConsultation?: CurrentConsultation | null
  className?: string
}

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  SCHEDULED: { color: 'bg-[#1B4F72]/10 text-[#1B4F72]', icon: Clock, label: 'Programmé' },
  CONFIRMED: { color: 'bg-[#27AE60]/10 text-[#27AE60]', icon: CheckCircle, label: 'Confirmé' },
  IN_PROGRESS: { color: 'bg-[#F39C12]/10 text-[#F39C12]', icon: Play, label: 'En cours' },
  COMPLETED: { color: 'bg-[#27AE60]/10 text-[#27AE60]', icon: CheckCircle, label: 'Terminé' },
  CANCELLED: { color: 'bg-[#E74C3C]/10 text-[#E74C3C]', icon: XCircle, label: 'Annulé' },
  NO_SHOW: { color: 'bg-gray-100 text-gray-500', icon: AlertCircle, label: 'Absence' },
}

export function TodaysSchedule({
  appointments = [],
  currentConsultation,
  className,
}: TodaysScheduleProps) {
  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  // Helper to parse time string (HH:mm) to minutes
  const parseTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Sort appointments by time
  const sortedAppointments = [...appointments].sort((a, b) => {
    return parseTimeToMinutes(a.appointmentTime) - parseTimeToMinutes(b.appointmentTime)
  })

  // Separate past and upcoming appointments
  const pastAppointments = sortedAppointments.filter((apt) => {
    const aptTime = parseTimeToMinutes(apt.appointmentTime) + apt.duration
    return aptTime < currentTimeInMinutes && apt.status !== 'IN_PROGRESS'
  })

  const upcomingAppointments = sortedAppointments.filter((apt) => {
    const aptTime = parseTimeToMinutes(apt.appointmentTime)
    return aptTime >= currentTimeInMinutes || apt.status === 'IN_PROGRESS'
  })

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#1B4F72]" />
            Agenda du jour
          </CardTitle>
          <Badge variant="secondary" className="bg-[#1B4F72]/10 text-[#1B4F72]">
            {appointments.length} rendez-vous
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Current Consultation Highlight */}
        {currentConsultation && (
          <div className="mb-4 p-4 rounded-lg bg-[#F39C12]/10 border border-[#F39C12]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#F39C12] uppercase tracking-wide">
                Consultation en cours
              </span>
              <span className="text-xs text-muted-foreground">
                Début: {currentConsultation.startTime}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F39C12] flex items-center justify-center text-white font-medium">
                {currentConsultation.patientName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{currentConsultation.patientName}</p>
                {currentConsultation.chiefComplaint && (
                  <p className="text-sm text-muted-foreground truncate">
                    {currentConsultation.chiefComplaint}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                className="bg-[#F39C12] hover:bg-[#F39C12]/90"
                asChild
              >
                <Link href={`/consultations/${currentConsultation.id}`}>
                  Voir
                </Link>
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="h-[350px] pr-4">
          {/* Upcoming Appointments */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              À venir
            </h4>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun rendez-vous à venir
              </p>
            ) : (
              upcomingAppointments.map((appointment) => {
                const config = statusConfig[appointment.status]
                const StatusIcon = config.icon
                const isNext = parseTimeToMinutes(appointment.appointmentTime) <= currentTimeInMinutes + 30 &&
                               parseTimeToMinutes(appointment.appointmentTime) > currentTimeInMinutes

                return (
                  <div
                    key={appointment.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-all',
                      isNext ? 'border-[#148F77]/30 bg-[#148F77]/5' : 'bg-muted/30',
                      appointment.status === 'IN_PROGRESS' && 'border-[#F39C12]/30 bg-[#F39C12]/5'
                    )}
                  >
                    <div className="flex flex-col items-center min-w-[50px]">
                      <span className="text-sm font-semibold">
                        {appointment.appointmentTime}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {appointment.duration}min
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {appointment.patientName}
                        </p>
                        {isNext && (
                          <Badge variant="secondary" className="text-xs bg-[#148F77]/10 text-[#148F77]">
                            Suivant
                          </Badge>
                        )}
                      </div>
                      {appointment.reason && (
                        <p className="text-xs text-muted-foreground truncate">
                          {appointment.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn('text-xs', config.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      {appointment.status === 'SCHEDULED' && appointment.patientId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          asChild
                        >
                          <Link href={`/consultations/new?patientId=${appointment.patientId}`}>
                            <Play className="h-3 w-3 mr-1" />
                            Démarrer
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Passés
              </h4>
              {pastAppointments.map((appointment) => {
                const config = statusConfig[appointment.status]
                const StatusIcon = config.icon

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 opacity-60"
                  >
                    <div className="flex flex-col items-center min-w-[50px]">
                      <span className="text-sm font-medium">
                        {appointment.appointmentTime}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {appointment.patientName}
                      </p>
                    </div>
                    <Badge variant="secondary" className={cn('text-xs', config.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
