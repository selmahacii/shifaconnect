'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  User,
  Stethoscope,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export interface RecentPatient {
  id: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  createdAt: string
}

export interface RecentConsultation {
  id: string
  patientName: string
  chiefComplaint: string
  status: string
  consultationDate: string
  consultationTime?: string
}

export interface UpcomingAppointment {
  id: string
  patientName: string
  appointmentTime: string
  reason?: string
  status: string
}

export interface RecentActivityProps {
  recentPatients?: RecentPatient[]
  recentConsultations?: RecentConsultation[]
  upcomingAppointments?: UpcomingAppointment[]
  className?: string
}

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-[#27AE60]/10 text-[#27AE60]',
  IN_PROGRESS: 'bg-[#F39C12]/10 text-[#F39C12]',
  SCHEDULED: 'bg-[#1B4F72]/10 text-[#1B4F72]',
  CANCELLED: 'bg-[#E74C3C]/10 text-[#E74C3C]',
  NO_SHOW: 'bg-gray-100 text-gray-500',
}

const statusLabels: Record<string, string> = {
  COMPLETED: 'Terminée',
  IN_PROGRESS: 'En cours',
  SCHEDULED: 'Programmée',
  CANCELLED: 'Annulée',
  NO_SHOW: 'Absence',
}

export function RecentActivity({
  recentPatients = [],
  recentConsultations = [],
  upcomingAppointments = [],
  className,
}: RecentActivityProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#1B4F72]" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-4">
          {/* Recent Consultations */}
          {recentConsultations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Consultations récentes
              </h4>
              <div className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <Link
                    key={consultation.id}
                    href={`/consultations/${consultation.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {consultation.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {consultation.chiefComplaint}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {consultation.consultationDate}
                        {consultation.consultationTime && ` à ${consultation.consultationTime}`}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs', statusColors[consultation.status] || '')}
                    >
                      {statusLabels[consultation.status] || consultation.status}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Patients */}
          {recentPatients.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Nouveaux patients
              </h4>
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                      patient.gender === 'MALE' ? 'bg-[#1B4F72]' : 'bg-pink-500'
                    )}>
                      {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ajouté le {patient.createdAt}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Prochains rendez-vous
              </h4>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#148F77]/20 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-[#148F77]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {appointment.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.appointmentTime}
                        {appointment.reason && ` - ${appointment.reason}`}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs', statusColors[appointment.status] || '')}
                    >
                      {statusLabels[appointment.status] || appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {recentPatients.length === 0 &&
            recentConsultations.length === 0 &&
            upcomingAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune activité récente
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
