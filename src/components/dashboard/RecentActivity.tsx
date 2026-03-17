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
  Activity,
  ChevronRight,
  Plus
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
  COMPLETED: 'bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20',
  IN_PROGRESS: 'bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20',
  SCHEDULED: 'bg-[#1B4F72]/10 text-[#1B4F72] border-[#1B4F72]/20',
  CANCELLED: 'bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/20',
  NO_SHOW: 'bg-slate-100 text-slate-500 border-slate-200',
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
    <Card className={cn('h-full border-none shadow-md rounded-2xl overflow-hidden bg-white', className)}>
      <CardHeader className="pb-4 border-b border-slate-50">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
                <Activity className="h-5 w-5 text-[#1B4F72]" />
                Activité récente
            </CardTitle>
            <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-100 font-bold text-[10px] text-slate-400 uppercase tracking-widest px-3 py-1">
                Live Feed
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px] custom-scrollbar">
          <div className="divide-y divide-slate-50">
            {/* Recent Consultations */}
            {recentConsultations.length > 0 && (
              <div className="p-6 pb-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Consultations récentes
                </h4>
                <div className="space-y-3">
                  {recentConsultations.map((consultation) => (
                    <Link
                      key={consultation.id}
                      href={`/dashboard/consultations/${consultation.id}`}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-[#1B4F72]/10 hover:bg-white hover:shadow-md transition-all group relative"
                    >
                      <div className="h-10 w-10 rounded-2xl bg-[#1B4F72]/5 flex items-center justify-center text-[#1B4F72] shrink-0 group-hover:bg-[#1B4F72] group-hover:text-white transition-colors">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-bold text-slate-900 truncate text-sm">
                            {consultation.patientName}
                          </p>
                          <Badge
                            className={cn('text-[10px] uppercase font-black tracking-tighter px-2 py-0.5 border', statusColors[consultation.status] || '')}
                          >
                            {statusLabels[consultation.status] || consultation.status}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-slate-500 truncate mb-1.5 italic">
                          "{consultation.chiefComplaint}"
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Clock className="h-3 w-3" />
                          {consultation.consultationDate}
                          {consultation.consultationTime && (
                              <span className="flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                                  {consultation.consultationTime}
                              </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 ml-1 mt-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Patients */}
            {recentPatients.length > 0 && (
              <div className="p-6 pb-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Nouveaux patients
                </h4>
                <div className="space-y-3">
                  {recentPatients.map((patient) => (
                    <Link
                      key={patient.id}
                      href={`/dashboard/patients/${patient.id}`}
                      className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                    >
                      <div className={cn(
                        'h-11 w-11 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-inner shadow-black/10',
                        patient.gender === 'MALE' ? 'bg-[#1B4F72]' : 'bg-pink-500'
                      )}>
                        {patient.firstName[0].toUpperCase()}{patient.lastName[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-[#1B4F72] transition-colors text-sm">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                          <Plus className="h-3 w-3 text-[#148F77]" />
                          Inscrit le {patient.createdAt}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#148F77] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {recentPatients.length === 0 &&
              recentConsultations.length === 0 &&
              upcomingAppointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center px-8">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Clock className="h-10 w-10 text-slate-200" />
                </div>
                <h4 className="text-base font-black text-slate-900">En attente d'activité</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[220px] leading-relaxed">
                  Aucune interaction récente n'a été enregistrée pour votre cabinet aujourd'hui.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
