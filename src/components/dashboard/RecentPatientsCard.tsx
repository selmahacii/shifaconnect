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
  ChevronRight,
  ExternalLink
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
  // Calculate age from date string or Date object
  const calculateAge = (dateVal: string | Date | undefined): number => {
    if (!dateVal) return 0
    
    let birthDate: Date
    if (typeof dateVal === 'string') {
        const parts = dateVal.split('/')
        if (parts.length === 3) {
            birthDate = new Date(
                parseInt(parts[2]),
                parseInt(parts[1]) - 1,
                parseInt(parts[0])
            )
        } else {
            birthDate = new Date(dateVal)
        }
    } else {
        birthDate = dateVal
    }
    
    if (isNaN(birthDate.getTime())) return 0
    
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <Card className={cn('h-full border-none shadow-md rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300', className)}>
      <CardHeader className="pb-4 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
            <User className="h-5 w-5 text-[#1B4F72]" />
            Patients récents
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1B4F72] hover:bg-[#1B4F72]/5">
            <Link href="/dashboard/patients" className="flex items-center gap-1.5">
              Voir tout
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <User className="h-10 w-10 text-slate-200" />
            </div>
            <h4 className="text-base font-black text-slate-900">Aucun patient</h4>
            <p className="text-xs text-slate-500 mt-2 max-w-[220px] leading-relaxed">
              Commencez par ajouter votre premier patient pour activer le monitoring.
            </p>
            <Button variant="outline" size="sm" className="mt-8 rounded-xl border-[#1B4F72]/20 text-[#1B4F72] font-bold hover:bg-[#1B4F72] hover:text-white transition-all shadow-sm" asChild>
              <Link href="/dashboard/patients/new">
                Inscrire un patient
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[450px] custom-scrollbar">
            <div className="divide-y divide-slate-50">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-4 p-5 transition-all duration-300 hover:bg-slate-50/50 group relative"
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'h-12 w-12 rounded-2xl flex items-center justify-center text-white text-base font-black flex-shrink-0 shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                      patient.gender === 'MALE' ? 'bg-[#1B4F72]' : 'bg-pink-500'
                    )}
                  >
                    {patient.firstName[0].toUpperCase()}{patient.lastName[0].toUpperCase()}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                       <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="font-black text-slate-900 group-hover:text-[#1B4F72] transition-colors truncate text-sm"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                      <Badge variant="outline" className="text-[9px] uppercase font-black text-slate-400 border-slate-200 px-2 py-0.5 rounded-full bg-white shadow-sm">
                        {calculateAge(patient.dateOfBirth)} ANS
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      {patient.phone && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                          <Phone className="h-3 w-3 text-[#148F77] opacity-60" />
                          {patient.phone}
                        </span>
                      )}
                      {patient.lastVisit && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#1B4F72]">
                          <Clock className="h-3 w-3 opacity-60" />
                          Visite: {patient.lastVisit}
                        </span>
                      )}
                    </div>
                    
                    {patient.lastComplaint && (
                      <p className="text-[11px] font-medium text-slate-400 truncate mt-1.5 italic group-hover:text-slate-600 transition-colors">
                        "{patient.lastComplaint}"
                      </p>
                    )}
                  </div>

                  {/* Actions (Hidden by default, shown on hover) */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-[#148F77] hover:bg-[#148F77]/10"
                        asChild
                        title="Démarrer consultation"
                    >
                        <Link href={`/dashboard/patients/${patient.id}?startConsultation=true`}>
                            <Stethoscope className="h-4.5 w-4.5" />
                        </Link>
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-[#1B4F72] hover:bg-[#1B4F72]/10"
                        asChild
                        title="Voir dossier"
                    >
                        <Link href={`/dashboard/patients/${patient.id}`}>
                            <ExternalLink className="h-4.5 w-4.5" />
                        </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
