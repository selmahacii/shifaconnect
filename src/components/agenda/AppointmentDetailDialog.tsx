'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  Edit,
  Check,
  X,
  Play,
  Loader2,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

// Types
interface Patient {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  fileNumber: string
  gender: string
}

interface Appointment {
  id: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  reason?: string | null
  status: string
  notes?: string | null
  patient?: Patient | null
}

// Status styles
const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'bg-blue-100 text-blue-700', text: 'text-blue-700', label: 'Programmé' },
  CONFIRMED: { bg: 'bg-green-100 text-green-700', text: 'text-green-700', label: 'Confirmé' },
  IN_PROGRESS: { bg: 'bg-orange-100 text-orange-700', text: 'text-orange-700', label: 'En cours' },
  COMPLETED: { bg: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', label: 'Terminé' },
  CANCELLED: { bg: 'bg-gray-100 text-gray-700', text: 'text-gray-700', label: 'Annulé' },
  NO_SHOW: { bg: 'bg-red-100 text-red-700', text: 'text-red-700', label: 'Absent' },
}

// Parse date DD/MM/YYYY
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

interface AppointmentDetailDialogProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
  onStartConsultation: (patientId: string) => void
}

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onUpdated,
  onStartConsultation,
}: AppointmentDetailDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = React.useState(false)

  if (!appointment) return null

  const status = statusStyles[appointment.status] || statusStyles.SCHEDULED
  const date = parseDateString(appointment.appointmentDate)

  // Calculate end time
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  const endTime = calculateEndTime(appointment.appointmentTime, appointment.duration)

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true)

      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      toast({
        title: 'Statut mis à jour',
        description: `Le rendez-vous a été marqué comme ${statusStyles[newStatus]?.label || newStatus}`,
      })

      onUpdated()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du statut',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle cancel
  const handleCancel = async () => {
    await handleStatusChange('CANCELLED')
  }

  // Handle confirm
  const handleConfirm = async () => {
    await handleStatusChange('CONFIRMED')
  }

  // Handle start consultation
  const handleStartConsultation = async () => {
    if (!appointment.patient) return

    try {
      setIsUpdating(true)

      // Update appointment status
      await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })

      // Navigate to new consultation
      onStartConsultation(appointment.patient.id)
    } catch (error) {
      console.error('Error starting consultation:', error)
      toast({
        title: 'Erreur',
        description: 'Erreur lors du démarrage de la consultation',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const patient = appointment.patient

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Détails du rendez-vous
          </DialogTitle>
          <DialogDescription>
            Informations et actions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Statut</span>
            <Badge className={cn(status.bg)}>
              {status.label}
            </Badge>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="capitalize">
                {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {appointment.appointmentTime} - {endTime}
                <span className="text-muted-foreground ml-2">({appointment.duration} min)</span>
              </span>
            </div>
          </div>

          <Separator />

          {/* Patient */}
          {patient && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Patient
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                  patient.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
                )}>
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                  <p className="text-sm text-muted-foreground">Dossier: {patient.fileNumber}</p>
                </div>
              </div>
              {patient.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${patient.phone}`} className="text-primary hover:underline">
                    {patient.phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          {appointment.reason && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Motif
                </div>
                <p className="text-sm">{appointment.reason}</p>
              </div>
            </>
          )}

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Notes</span>
                <p className="text-sm bg-muted/30 p-2 rounded">{appointment.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <div className="flex gap-2 w-full sm:w-auto">
            {appointment.status === 'SCHEDULED' && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleConfirm}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Confirmer
              </Button>
            )}

            {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
              <>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleStartConsultation}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Démarrer
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Annuler le rendez-vous</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir annuler ce rendez-vous?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Non, garder</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Oui, annuler
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>

          {appointment.status === 'IN_PROGRESS' && (
            <Button
              className="w-full sm:w-auto"
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Marquer terminé
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentDetailDialog
