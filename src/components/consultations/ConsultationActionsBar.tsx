'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Edit,
  Printer,
  Pill,
  FileText,
  Calendar,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface ConsultationActionsBarProps {
  consultationId: string
  patientId: string
  hasPrescriptions: boolean
  className?: string
}

export function ConsultationActionsBar({
  consultationId,
  patientId,
  hasPrescriptions,
  className,
}: ConsultationActionsBarProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      toast({
        title: 'Consultation supprimée',
        description: 'La consultation a été supprimée avec succès.',
      })

      router.push('/consultations')
      router.refresh()
    } catch (error) {
      console.error('Error deleting consultation:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Primary Actions */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/consultations/${consultationId}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Link>
      </Button>

      <Button variant="outline" size="sm" asChild>
        <Link
          href={`/prescriptions/new?patientId=${patientId}&consultationId=${consultationId}`}
        >
          <Pill className="h-4 w-4 mr-2" />
          Créer une ordonnance
        </Link>
      </Button>

      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimer
      </Button>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/agenda?patientId=${patientId}`}>
              <Calendar className="h-4 w-4 mr-2" />
              Planifier un rendez-vous
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/documents/new?patientId=${patientId}&consultationId=${consultationId}`}>
              <FileText className="h-4 w-4 mr-2" />
              Ajouter un document
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer la consultation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer cette consultation? Cette action est irréversible.
                  {hasPrescriptions && (
                    <p className="mt-2 text-destructive font-medium">
                      Cette consultation a des ordonnances liées. Veuillez les supprimer d&apos;abord.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting || hasPrescriptions}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
