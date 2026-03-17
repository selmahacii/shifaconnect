'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  User,
  Stethoscope,
  Phone,
  Clock,
  ArrowRight,
  Activity,
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
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 transition-all duration-300 hover:bg-slate-50 hover:shadow-sm group"
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110',
                      patient.gender === 'MALE' ? 'bg-[#1B4F72]' : 'bg-[#D35400]'
                    )}
                  >
                    {patient.firstName[0]}{patient.lastName[0]}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                       <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="font-bold text-slate-900 hover:text-[#1B4F72] transition-colors truncate"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200 px-1 py-0">
                        {calculateAge(patient.dateOfBirth)} ANS
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-slate-500">
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 opacity-70" />
                          {patient.phone}
                        </span>
                      )}
                      {patient.lastVisit && (
                        <span className="flex items-center gap-1 text-[#148F77]">
                          <Clock className="h-3 w-3 opacity-70" />
                          {patient.lastVisit}
                        </span>
                      )}
                    </div>
                    
                    {patient.lastComplaint && (
                      <p className="text-[11px] text-slate-400 truncate mt-1 italic">
                        "{patient.lastComplaint}"
                      </p>
                    )}
                  </div>

                  {/* Quick Action Button */}
                  <Button
                    size="icon"
                    className="bg-[#148F77]/10 text-[#148F77] hover:bg-[#148F77] hover:text-white rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                    asChild
                  >
                    <Link href={`/dashboard/patients/${patient.id}?startConsultation=true`}>
                      <Stethoscope className="h-4 w-4" />
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
