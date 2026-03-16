'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  User,
  Stethoscope,
  Phone,
  Clock,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export interface RecentPatientData {
  id: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth: string
  phone?: string | null
  lastVisit?: string | null
  lastComplaint?: string | null
}

export interface RecentPatientsCardProps {
  patients?: RecentPatientData[]
  className?: string
}

export function RecentPatientsCard({
  patients = [],
  className,
}: RecentPatientsCardProps) {
  // Calculate age from date string
  const calculateAge = (dateString: string): number => {
    const parts = dateString.split('/')
    if (parts.length !== 3) return 0
    
    const birthDate = new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0])
    )
    
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-[#1B4F72]" />
            Patients récents
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/patients" className="text-[#1B4F72]">
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun patient récent
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/dashboard/patients/new">
                Ajouter un patient
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0',
                      patient.gender === 'MALE' ? 'bg-[#1B4F72]' : 'bg-pink-500'
                    )}
                  >
                    {patient.firstName[0]}{patient.lastName[0]}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/patients/${patient.id}`}
                      className="font-medium text-sm hover:text-[#1B4F72] transition-colors"
                    >
                      {patient.firstName} {patient.lastName}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {calculateAge(patient.dateOfBirth)} ans
                      </span>
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </span>
                      )}
                    </div>
                    {patient.lastComplaint && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {patient.lastComplaint}
                      </p>
                    )}
                    {patient.lastVisit && (
                      <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        Dernière visite: {patient.lastVisit}
                      </p>
                    )}
                  </div>

                  {/* Quick Action Button */}
                  <Button
                    size="sm"
                    className="bg-[#148F77] hover:bg-[#148F77]/90 flex-shrink-0"
                    asChild
                  >
                    <Link href={`/dashboard/patients/${patient.id}?startConsultation=true`}>
                      <Stethoscope className="h-4 w-4 mr-1" />
                      Consulter
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
