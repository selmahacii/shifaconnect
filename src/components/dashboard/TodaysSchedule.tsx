
'use client'

import * as React from 'react'
import { 
  Clock, 
  User, 
  ChevronRight, 
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export interface TodaysAppointment {
  id: string
  patientId?: string
  patientName: string
  appointmentTime: string
  duration: number
  reason?: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

export interface TodaysScheduleProps {
  appointments?: any[]
  className?: string
}

export function TodaysSchedule({ appointments: initialAppointments, className }: TodaysScheduleProps) {
  const [appointments, setAppointments] = React.useState<any[]>(initialAppointments || [])
  const supabase = createClient()

  const refreshAppointments = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await (supabase
      .from('appointments')
      .select('*, patient:patients(*)')
      .eq('appointment_date', today)
      .order('appointment_time', { ascending: true }) as any)
    
    if (data) setAppointments(data)
  }

  React.useEffect(() => {
    if (!initialAppointments) {
      refreshAppointments()
    }
  }, [initialAppointments])

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await (supabase.from('appointments') as any)
      .update({ status: newStatus })
      .eq('id', id)
    
    if (!error) refreshAppointments()
  }

  return (
    <Card className={cn("h-full border-none shadow-md overflow-hidden bg-white", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#1B4F72]" />
          Agenda du jour
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-[#1B4F72] hover:text-[#1B4F72] hover:bg-blue-50">
          <Link href="/dashboard/agenda">
            Voir tout
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <div key={apt.id} className="group p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className="w-16 flex flex-col items-center justify-center py-1 bg-slate-100 rounded text-slate-600">
                  <span className="text-sm font-bold leading-none">{apt.appointment_time}</span>
                  <span className="text-[10px] mt-1 opacity-60">{apt.duration}m</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 truncate text-sm">
                      {apt.patient?.last_name || apt.patientName} {apt.patient?.first_name || ''}
                    </p>
                    {getStatusIndicator(apt.status)}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {apt.reason || 'Consultation'}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   {(apt.status.toUpperCase() === 'CONFIRMED' || apt.status.toUpperCase() === 'SCHEDULED') && (
                     <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-[#1B4F72] hover:bg-blue-50" title="Démarrer consultation">
                        <Link href={`/dashboard/patients/${apt.patient_id || apt.patientId}?startConsultation=true&appointmentId=${apt.id}`}>
                           <Play className="h-4 w-4" />
                        </Link>
                     </Button>
                   )}
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => updateStatus(apt.id, 'CONFIRMED')}>Confirmer</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => updateStatus(apt.id, 'COMPLETED')}>Marquer Terminé</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => updateStatus(apt.id, 'CANCELLED')} className="text-red-600">Annuler</DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6">
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-slate-300" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Aucun rendez-vous</h4>
              <p className="text-xs text-slate-500 mt-1">
                Aucun rendez-visite pour aujourd'hui.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusIndicator(status: string) {
  switch (status.toUpperCase()) {
    case 'SCHEDULED': return <div className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Planifié" />
    case 'CONFIRMED': return <div className="h-1.5 w-1.5 rounded-full bg-green-500" title="Confirmé" />
    case 'CANCELLED': 
    case 'REJECTED': return <div className="h-1.5 w-1.5 rounded-full bg-red-500" title="Annulé" />
    case 'NO_SHOW': return <div className="h-1.5 w-1.5 rounded-full bg-slate-400" title="No-show" />
    case 'COMPLETED': return <div className="h-1.5 w-1.5 rounded-full bg-purple-500" title="Terminé" />
    default: return <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
  }
}
