'use client'

import * as React from 'react'
import Link from 'next/link'
import { format, parse } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, ChevronRight, Clock, FileText, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Consultation } from '@prisma/client'

// Status badge colors
const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  NO_SHOW: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Programmée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  NO_SHOW: 'Absence',
}

interface ConsultationWithPatient extends Consultation {
  patient?: {
    id: string
    firstName: string
    lastName: string
    fileNumber: string
  }
}

interface ConsultationHistoryProps {
  consultations: ConsultationWithPatient[]
  patientId?: string
  showPatient?: boolean
  limit?: number
  className?: string
  emptyMessage?: string
  onViewDetails?: (consultationId: string) => void
}

// Parse DD/MM/YYYY date string
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

// Sort consultations by date (newest first)
function sortConsultationsByDate(consultations: ConsultationWithPatient[]): ConsultationWithPatient[] {
  return [...consultations].sort((a, b) => {
    const dateA = parseDateString(a.consultationDate)
    const dateB = parseDateString(b.consultationDate)
    // Sort by date descending, then by time descending
    const dateCompare = dateB.getTime() - dateA.getTime()
    if (dateCompare !== 0) return dateCompare
    return (b.consultationTime || '').localeCompare(a.consultationTime || '')
  })
}

export function ConsultationHistory({
  consultations,
  patientId,
  showPatient = false,
  limit,
  className,
  emptyMessage = 'Aucune consultation enregistrée',
  onViewDetails,
}: ConsultationHistoryProps) {
  // Filter by patient if patientId is provided
  const filteredConsultations = React.useMemo(() => {
    let result = patientId
      ? consultations.filter(c => c.patientId === patientId)
      : consultations
    
    // Sort by date (newest first)
    result = sortConsultationsByDate(result)
    
    // Apply limit if provided
    if (limit && limit > 0) {
      result = result.slice(0, limit)
    }
    
    return result
  }, [consultations, patientId, limit])

  // Group consultations by month
  const groupedConsultations = React.useMemo(() => {
    const groups: Record<string, ConsultationWithPatient[]> = {}
    
    filteredConsultations.forEach(consultation => {
      const date = parseDateString(consultation.consultationDate)
      const monthKey = format(date, 'MMMM yyyy', { locale: fr })
      
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(consultation)
    })
    
    return groups
  }, [filteredConsultations])

  if (filteredConsultations.length === 0) {
    return (
      <Card className={cn('border-border/50', className)}>
        <CardContent className="py-8 text-center">
          <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Historique des consultations
        </CardTitle>
        <CardDescription>
          {filteredConsultations.length} consultation{filteredConsultations.length > 1 ? 's' : ''} enregistrée{filteredConsultations.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[500px]">
          <div className="px-6 pb-4 space-y-6">
            {Object.entries(groupedConsultations).map(([month, monthConsultations]) => (
              <div key={month} className="space-y-2">
                {/* Month Header */}
                <h3 className="text-sm font-medium text-muted-foreground capitalize sticky top-0 bg-card py-1">
                  {month}
                </h3>
                
                {/* Consultations List */}
                <div className="space-y-2">
                  {monthConsultations.map((consultation) => (
                    <ConsultationHistoryItem
                      key={consultation.id}
                      consultation={consultation}
                      showPatient={showPatient}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface ConsultationHistoryItemProps {
  consultation: ConsultationWithPatient
  showPatient?: boolean
  onViewDetails?: (consultationId: string) => void
}

function ConsultationHistoryItem({ consultation, showPatient, onViewDetails }: ConsultationHistoryItemProps) {
  const date = parseDateString(consultation.consultationDate)
  const formattedDate = format(date, 'EEEE d', { locale: fr })
  const statusColor = statusColors[consultation.status] || statusColors.COMPLETED
  const statusLabel = statusLabels[consultation.status] || consultation.status

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(consultation.id)
    }
  }

  const content = (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
      {/* Date Badge */}
      <div className="flex flex-col items-center min-w-[50px]">
        <span className="text-xs text-muted-foreground capitalize">{format(date, 'MMM', { locale: fr })}</span>
        <span className="text-lg font-semibold">{format(date, 'd')}</span>
        <span className="text-xs text-muted-foreground">{format(date, 'yyyy')}</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Time */}
            {consultation.consultationTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                {consultation.consultationTime}
              </div>
            )}
            
            {/* Chief Complaint */}
            <p className="font-medium text-sm truncate">
              {consultation.chiefComplaint}
            </p>
            
            {/* Patient Name (if showing) */}
            {showPatient && consultation.patient && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {consultation.patient.firstName} {consultation.patient.lastName}
              </p>
            )}
            
            {/* Diagnosis */}
            {consultation.diagnosis && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                <FileText className="h-3 w-3 inline mr-1" />
                {consultation.diagnosis}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <Badge variant="outline" className={cn('text-xs', statusColor)}>
              {statusLabel}
            </Badge>
            
            {/* Chevron */}
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* ICD Code */}
        {consultation.icdCode && (
          <Badge variant="secondary" className="text-xs mt-2">
            CIM-10: {consultation.icdCode}
          </Badge>
        )}
      </div>
    </div>
  )

  if (onViewDetails) {
    return (
      <div onClick={handleClick}>
        {content}
      </div>
    )
  }

  return (
    <Link href={`/consultations/${consultation.id}`}>
      {content}
    </Link>
  )
}

export default ConsultationHistory
