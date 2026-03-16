'use client'

import * as React from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Users, 
  Search,
  Calendar,
  Phone,
  MapPin,
  User,
  MoreVertical,
  ExternalLink,
  History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { WILAYAS } from '@/lib/constants'

interface Patient {
  id: string
  first_name: string
  last_name: string
  first_name_ar: string | null
  last_name_ar: string | null
  date_of_birth: string
  phone: string | null
  wilaya: string | null
  gender: 'M' | 'F'
  national_id?: string | null
  chifa_number?: string | null
  last_visit?: string | null
}

interface PatientListContentProps {
  initialPatients: Patient[]
}

export function PatientListContent({ initialPatients }: PatientListContentProps) {
  const [search, setSearch] = React.useState('')
  const [wilayaFilter, setWilayaFilter] = React.useState('all')
  const [sortBy, setSortBy] = React.useState<'name' | 'last_visit'>('name')
  
  const filteredPatients = React.useMemo(() => {
    return initialPatients
      .filter(p => {
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
        const matchesSearch = 
          fullName.includes(search.toLowerCase()) ||
          p.national_id?.includes(search) ||
          p.chifa_number?.includes(search)
        
        const matchesWilaya = wilayaFilter === 'all' || p.wilaya === wilayaFilter
        
        return matchesSearch && matchesWilaya
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        } else {
          const dateA = a.last_visit ? new Date(a.last_visit).getTime() : 0
          const dateB = b.last_visit ? new Date(b.last_visit).getTime() : 0
          return dateB - dateA
        }
      })
  }, [initialPatients, search, wilayaFilter, sortBy])

  // Pagination (client-side for simplicity as per "real-time client-side filter" request)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 20
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getInitials = (p: Patient) => {
    return `${p.first_name[0]}${p.last_name[0]}`.toUpperCase()
  }

  const formatBirthDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy')
    } catch {
      return dateStr
    }
  }

  const getAge = (dateStr: string) => {
    try {
      const birthDate = new Date(dateStr)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return 0
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher par nom, NIN, Carte Chifa..." 
            className="pl-10 h-11"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <Select value={wilayaFilter} onValueChange={(v) => { setWilayaFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-[180px] h-11">
              <SelectValue placeholder="Wilaya" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les wilayas</SelectItem>
              {WILAYAS.map(w => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: 'name' | 'last_visit') => setSortBy(v)}>
            <SelectTrigger className="w-full md:w-[180px] h-11">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom complet</SelectItem>
              <SelectItem value="last_visit">Dernière visite</SelectItem>
            </SelectContent>
          </Select>
          
          <Button asChild className="h-11 bg-[#1B4F72] hover:bg-[#1B4F72]/90 hidden md:flex">
            <Link href="/dashboard/patients/new">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau patient
            </Link>
          </Button>
        </div>
      </div>

      {paginatedPatients.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="rounded-full bg-slate-50 p-6 mb-4">
              <Users className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Aucun patient enregistré</h3>
            <p className="text-slate-500 max-w-sm mt-1">
              {search || wilayaFilter !== 'all' 
                ? "Aucun résultat ne correspond à vos filtres de recherche." 
                : "Commencez par ajouter votre premier patient pour créer son dossier médical."}
            </p>
            <Button asChild className="mt-6 bg-[#1B4F72]" variant="default">
              <Link href="/dashboard/patients/new">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un patient
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Nom complet</TableHead>
                  <TableHead className="font-bold text-slate-700">Date de naissance</TableHead>
                  <TableHead className="font-bold text-slate-700">Téléphone</TableHead>
                  <TableHead className="font-bold text-slate-700">Wilaya</TableHead>
                  <TableHead className="font-bold text-slate-700">Dernière consultation</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                    <TableCell onClick={() => window.location.href = `/dashboard/patients/${patient.id}`}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          patient.gender === 'M' ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
                        )}>
                          {getInitials(patient)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {patient.last_name} {patient.first_name}
                          </p>
                          {patient.last_name_ar && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5" dir="rtl">
                              {patient.last_name_ar} {patient.first_name_ar}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => window.location.href = `/dashboard/patients/${patient.id}`}>
                      <p className="text-sm font-medium text-slate-700">{formatBirthDate(patient.date_of_birth)}</p>
                      <p className="text-xs text-slate-400">{getAge(patient.date_of_birth)} ans</p>
                    </TableCell>
                    <TableCell onClick={() => window.location.href = `/dashboard/patients/${patient.id}`}>
                      <p className="text-sm font-medium text-slate-700">{patient.phone || '-'}</p>
                    </TableCell>
                    <TableCell onClick={() => window.location.href = `/dashboard/patients/${patient.id}`}>
                      <p className="text-sm font-medium text-slate-700">{patient.wilaya || '-'}</p>
                    </TableCell>
                    <TableCell onClick={() => window.location.href = `/dashboard/patients/${patient.id}`}>
                      {patient.last_visit ? (
                        <div className="flex items-center gap-2">
                          <History className="h-3.3 w-3.5 text-slate-400" />
                          <p className="text-sm font-medium text-slate-700">
                            {format(new Date(patient.last_visit), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Aucune</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/patients/${patient.id}`} className="flex items-center">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Voir le dossier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/consultations/new?patientId=${patient.id}`} className="flex items-center">
                              <History className="mr-2 h-4 w-4" />
                              Nouvelle consultation
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {paginatedPatients.map((patient) => (
              <Link key={patient.id} href={`/dashboard/patients/${patient.id}`}>
                <Card className="active:scale-[0.98] transition-transform">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold",
                          patient.gender === 'M' ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
                        )}>
                          {getInitials(patient)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {patient.last_name} {patient.first_name}
                          </p>
                          <p className="text-xs text-slate-500">{getAge(patient.date_of_birth)} ans • {patient.wilaya || 'Algérie'}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">{patient.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <History className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">
                          {patient.last_visit ? format(new Date(patient.last_visit), 'dd/MM/yy') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Précédent
              </Button>
              <div className="text-sm text-slate-500 px-4">
                Page {currentPage} sur {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {/* Floating Action Button for Mobile */}
      <Button 
        asChild 
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-[#1B4F72] p-0"
      >
        <Link href="/dashboard/patients/new">
          <Plus className="h-6 w-6 text-white" />
        </Link>
      </Button>
    </div>
  )
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
