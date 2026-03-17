
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
  Play,
  Activity
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface TodaysAppointment {
  id: string
  patientId?: string
  patientName: string
  appointmentTime: string
  duration: number
  reason?: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  patient?: {
    id: string
    firstName: string
    lastName: string
    gender?: string
  }
}

export interface TodaysScheduleProps {
  appointments?: any[]
  className?: string
}

export function TodaysSchedule({ appointments: initialAppointments, className }: TodaysScheduleProps) {
  const [appointments, setAppointments] = React.useState<any[]>(initialAppointments || [])
  const [loading, setLoading] = React.useState(false)

  const refreshAppointments = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/appointments?date=${today}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments)
    } else {
      refreshAppointments()
    }
  }, [initialAppointments])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        toast.success(`Statut mis à jour : ${newStatus}`)
        refreshAppointments()
      } else {
        toast.error('Erreur lors de la mise à jour du statut')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erreur réseau')
    }
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
        <div className="divide-y divide-slate-50 max-h-[450px] overflow-y-auto custom-scrollbar">
          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <div key={apt.id} className="group p-5 hover:bg-slate-50/80 transition-all duration-300 flex items-center gap-5">
                <div className="w-16 flex flex-col items-center justify-center py-2 bg-slate-100 rounded-2xl text-slate-600 transition-colors group-hover:bg-[#1B4F72]/10 group-hover:text-[#1B4F72]">
                  <span className="text-xs font-black leading-none">{apt.appointment_time || apt.appointmentTime}</span>
                  <span className="text-[9px] font-bold mt-1 opacity-60 uppercase tracking-tighter">{apt.duration} min</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 truncate text-sm">
                      {apt.patientName || (apt.patient ? `${apt.patient.last_name || apt.patient.lastName} ${apt.patient.first_name || apt.patient.firstName}` : 'Patient inconnu')}
                    </p>
                    {getStatusIndicator(apt.status)}
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <Activity className="h-3 w-3 opacity-50" />
                    {apt.reason || 'Consultation générale'}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                   {(apt.status?.toUpperCase() === 'CONFIRMED' || apt.status?.toUpperCase() === 'SCHEDULED') && (
                     <Button asChild size="icon" variant="ghost" className="h-9 w-9 text-[#148F77] hover:bg-[#148F77]/10 rounded-xl" title="Démarrer consultation">
                        <Link href={`/dashboard/patients/${apt.patientId || (apt.patient?.id)}?startConsultation=true&appointmentId=${apt.id}`}>
                           <Play className="h-4 w-4 fill-current" />
                        </Link>
                     </Button>
                   )}
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-200 rounded-xl">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100">
                         <DropdownMenuItem onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="font-medium p-2 cursor-pointer">
                           <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                           Confirmer
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => updateStatus(apt.id, 'COMPLETED')} className="font-medium p-2 cursor-pointer">
                           <CheckCircle2 className="h-4 w-4 mr-2 text-purple-500" />
                           Marquer Terminé
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => updateStatus(apt.id, 'CANCELLED')} className="font-medium p-2 cursor-pointer text-red-600 focus:text-red-600">
                           <AlertCircle className="h-4 w-4 mr-2" />
                           Annuler
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center px-8">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-slate-200" />
              </div>
              <h4 className="text-base font-black text-slate-900">{loading ? 'Chargement...' : 'Journée calme ✨'}</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                {loading ? 'Nous préparons votre planning...' : 'Aucun rendez-vous prévu pour le moment.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusIndicator(status: string) {
  if (!status) return <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
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
