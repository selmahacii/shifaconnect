
'use client'

import * as React from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Stethoscope, 
  X, 
  CheckCircle2, 
  Trash2,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import Link from 'next/link'

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AppointmentDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any | null
  onSuccess?: () => void
}

export function AppointmentDetailModal({ open, onOpenChange, appointment, onSuccess }: AppointmentDetailModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  if (!appointment) return null

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const { error } = await (supabase.from('appointments') as any)
        .update({ status: newStatus })
        .eq('id', appointment.id)

      if (error) throw error
      toast.success(`Statut mis à jour: ${newStatus}`)
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAppointment = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return
    setIsLoading(true)
    try {
      const { error } = await (supabase.from('appointments') as any)
        .delete()
        .eq('id', appointment.id)

      if (error) throw error
      toast.success('Rendez-vous supprimé')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED': return <Badge className="bg-blue-100 text-blue-700 border-none">Planifié</Badge>
      case 'CONFIRMED': return <Badge className="bg-green-100 text-green-700 border-none">Confirmé</Badge>
      case 'CANCELLED': return <Badge className="bg-red-100 text-red-700 border-none">Annulé</Badge>
      case 'NO_SHOW': return <Badge className="bg-slate-100 text-slate-700 border-none">No-show</Badge>
      case 'COMPLETED': return <Badge className="bg-purple-100 text-purple-700 border-none">Terminé</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
        <div className="bg-[#1B4F72] p-6 text-white text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">{appointment.patient.last_name} {appointment.patient.first_name}</h2>
          <div className="flex items-center justify-center gap-2">
            {getStatusBadge(appointment.status)}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </span>
              <p className="font-bold text-slate-800">
                {format(new Date(appointment.appointment_date), 'EEEE d MMMM', { locale: fr })}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Heure & Durée
              </span>
              <p className="font-bold text-slate-800">
                {appointment.appointment_time} ({appointment.duration || 20} min)
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <FileText className="h-3 w-3" /> Motif
            </span>
            <p className="text-slate-700 font-medium">
              {appointment.reason || 'Consultation générale'}
            </p>
          </div>

          {appointment.notes && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Notes internes</span>
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border italic">
                {appointment.notes}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4">
            {appointment.status.toUpperCase() !== 'COMPLETED' && appointment.status.toUpperCase() !== 'CANCELLED' && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => updateStatus('CONFIRMED')}
                  disabled={isLoading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:bg-red-50 border-red-100"
                  onClick={() => updateStatus('CANCELLED')}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" /> Annuler
                </Button>
              </>
            )}
            
            {(appointment.status.toUpperCase() === 'CONFIRMED' || appointment.status.toUpperCase() === 'SCHEDULED') && (
              <Button asChild size="sm" className="bg-[#1B4F72] hover:bg-[#153e5a]">
                <Link href={`/dashboard/patients/${appointment.patient_id}?startConsultation=true&appointmentId=${appointment.id}`}>
                  <Stethoscope className="h-4 w-4 mr-2" /> Démarrer consultation
                </Link>
              </Button>
            )}

            <Button size="sm" variant="ghost" className="text-slate-400 ml-auto" onClick={deleteAppointment} disabled={isLoading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 p-4 border-t">
          <Button asChild variant="ghost" size="sm" className="w-full text-[#1B4F72] font-bold">
            <Link href={`/dashboard/patients/${appointment.patient_id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir le dossier patient complet
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
