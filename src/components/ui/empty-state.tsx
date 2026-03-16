'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Users,
  FileText,
  Calendar,
  Stethoscope,
  ClipboardList,
  Search,
  FolderOpen,
  Inbox,
  AlertCircle,
  Plus,
} from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

const iconMap: Record<string, React.ReactNode> = {
  patients: <Users className="h-12 w-12 text-muted-foreground/50" />,
  consultations: <Stethoscope className="h-12 w-12 text-muted-foreground/50" />,
  prescriptions: <ClipboardList className="h-12 w-12 text-muted-foreground/50" />,
  appointments: <Calendar className="h-12 w-12 text-muted-foreground/50" />,
  documents: <FileText className="h-12 w-12 text-muted-foreground/50" />,
  search: <Search className="h-12 w-12 text-muted-foreground/50" />,
  folder: <FolderOpen className="h-12 w-12 text-muted-foreground/50" />,
  inbox: <Inbox className="h-12 w-12 text-muted-foreground/50" />,
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-muted p-4">
        {icon || <Inbox className="h-12 w-12 text-muted-foreground/50" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#1B4F72] hover:bg-[#1B4F72]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Preset empty states for common use cases
export function EmptyPatients({ onAddNew }: { onAddNew?: () => void }) {
  return (
    <EmptyState
      icon={iconMap.patients}
      title="Aucun patient"
      description="Vous n'avez pas encore de patients. Commencez par ajouter votre premier patient."
      action={onAddNew ? { label: 'Ajouter un patient', onClick: onAddNew } : undefined}
    />
  )
}

export function EmptyConsultations({ onAddNew }: { onAddNew?: () => void }) {
  return (
    <EmptyState
      icon={iconMap.consultations}
      title="Aucune consultation"
      description="Aucune consultation enregistrée. Commencez par créer une nouvelle consultation."
      action={onAddNew ? { label: 'Nouvelle consultation', onClick: onAddNew } : undefined}
    />
  )
}

export function EmptyPrescriptions() {
  return (
    <EmptyState
      icon={iconMap.prescriptions}
      title="Aucune ordonnance"
      description="Aucune ordonnance n'a été créée pour ce patient."
    />
  )
}

export function EmptyAppointments({ onAddNew }: { onAddNew?: () => void }) {
  return (
    <EmptyState
      icon={iconMap.appointments}
      title="Aucun rendez-vous"
      description="Aucun rendez-vous prévu pour cette période."
      action={onAddNew ? { label: 'Prendre RDV', onClick: onAddNew } : undefined}
    />
  )
}

export function EmptyDocuments() {
  return (
    <EmptyState
      icon={iconMap.documents}
      title="Aucun document"
      description="Aucun document médical n'a été attaché à ce dossier."
    />
  )
}

export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={iconMap.search}
      title="Aucun résultat"
      description={
        query
          ? `Aucun résultat trouvé pour "${query}". Essayez avec d'autres termes.`
          : "Aucun résultat trouvé. Essayez avec d'autres termes de recherche."
      }
    />
  )
}

export function ErrorState({
  title = "Erreur de chargement",
  description = "Une erreur est survenue lors du chargement des données. Veuillez réessayer.",
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="gap-2"
        >
          Réessayer
        </Button>
      )}
    </div>
  )
}
