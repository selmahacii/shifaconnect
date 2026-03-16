'use client'

import * as React from 'react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, parse, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Pill,
  MoreHorizontal,
  FileCheck,
  FileX,
  Clock,
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

// Types
interface Patient {
  id: string
  firstName: string
  lastName: string
  fileNumber: string
}

interface Doctor {
  id: string
  professionalTitle?: string | null
  user: {
    name: string
  }
}

interface Prescription {
  id: string
  prescriptionDate: string
  prescriptionNumber?: string
  diagnosis?: string | null
  isValid: boolean
  createdAt: string
  patient: Patient
  doctor: Doctor
  _count?: {
    items: number
  }
}

interface PrescriptionsResponse {
  prescriptions: Prescription[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    totalMonth: number
    validCount: number
    voidedCount: number
  }
}

// Status badge styles
const statusStyles = {
  valid: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    label: 'Valide',
  },
  voided: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    label: 'Annulée',
  },
}

// Parse date string DD/MM/YYYY
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

// Generate prescription number from ID
function generatePrescriptionNumber(id: string, date: string): string {
  const shortId = id.slice(-6).toUpperCase()
  const [day, month, year] = date.split('/')
  return `ORD-${year}${month}${day}-${shortId}`
}

export default function PrescriptionsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [dateFilter, setDateFilter] = React.useState<string>('month')
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([])
  const [stats, setStats] = React.useState<{ totalMonth: number; validCount: number; voidedCount: number } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Fetch prescriptions
  const fetchPrescriptions = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      // Date filter
      const today = new Date()
      if (dateFilter === 'today') {
        params.set('startDate', format(today, 'dd/MM/yyyy'))
        params.set('endDate', format(today, 'dd/MM/yyyy'))
      } else if (dateFilter === 'week') {
        params.set('startDate', format(startOfWeek(today, { weekStartsOn: 1 }), 'dd/MM/yyyy'))
        params.set('endDate', format(endOfWeek(today, { weekStartsOn: 1 }), 'dd/MM/yyyy'))
      } else if (dateFilter === 'month') {
        params.set('startDate', format(startOfMonth(today), 'dd/MM/yyyy'))
        params.set('endDate', format(endOfMonth(today), 'dd/MM/yyyy'))
      }
      
      if (searchQuery) {
        params.set('search', searchQuery)
      }
      
      params.set('limit', '50')
      params.set('stats', 'true')
      
      const response = await fetch(`/api/prescriptions?${params.toString()}`)
      
      if (!response.ok) throw new Error('Failed to fetch prescriptions')
      
      const data: PrescriptionsResponse = await response.json()
      setPrescriptions(data.prescriptions)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateFilter, searchQuery])

  React.useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrescriptions()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchPrescriptions])

  // Group prescriptions by date
  const groupedPrescriptions = React.useMemo(() => {
    const groups: Record<string, Prescription[]> = {}
    
    prescriptions.forEach(prescription => {
      const date = parseDateString(prescription.prescriptionDate)
      const displayKey = format(date, 'EEEE d MMMM yyyy', { locale: fr })
      
      if (!groups[displayKey]) {
        groups[displayKey] = []
      }
      groups[displayKey].push(prescription)
    })
    
    return groups
  }, [prescriptions])

  // Handle download PDF
  const handleDownloadPDF = async (prescriptionId: string, patientName: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/pdf`)
      if (!response.ok) throw new Error('Erreur lors de la génération du PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ordonnance-${patientName.replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Ordonnances
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les ordonnances et prescriptions
            </p>
          </div>
          <Link href="/patients">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle ordonnance
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ce mois
                </CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMonth}</div>
                <p className="text-xs text-muted-foreground">
                  Ordonnances ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Validées
                </CardTitle>
                <FileCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.validCount}</div>
                <p className="text-xs text-muted-foreground">
                  Ordonnances valides
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Annulées
                </CardTitle>
                <FileX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.voidedCount}</div>
                <p className="text-xs text-muted-foreground">
                  Ordonnances annulées
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par patient, diagnostic, N° ordonnance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="all">Toutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Liste des ordonnances
            </CardTitle>
            <CardDescription>
              {prescriptions.length} ordonnance{prescriptions.length > 1 ? 's' : ''} trouvée{prescriptions.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune ordonnance trouvée</p>
                <Link href="/patients">
                  <Button variant="link" className="mt-2">
                    Créer une nouvelle ordonnance
                  </Button>
                </Link>
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <div className="px-6 pb-4 space-y-6">
                  {Object.entries(groupedPrescriptions).map(([date, datePrescriptions]) => (
                    <div key={date} className="space-y-2">
                      {/* Date Header */}
                      <h3 className="text-sm font-medium text-muted-foreground capitalize sticky top-0 bg-card py-1 z-10">
                        {date}
                      </h3>
                      
                      {/* Prescriptions for this date */}
                      <div className="space-y-2">
                        {datePrescriptions.map((prescription) => {
                          const statusStyle = prescription.isValid ? statusStyles.valid : statusStyles.voided
                          const prescriptionNumber = prescription.prescriptionNumber || 
                            generatePrescriptionNumber(prescription.id, prescription.prescriptionDate)
                          
                          return (
                            <div
                              key={prescription.id}
                              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                            >
                              {/* Main Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    {/* Patient Name */}
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <p className="font-medium">
                                        {prescription.patient.firstName} {prescription.patient.lastName}
                                      </p>
                                    </div>
                                    
                                    {/* Prescription Number */}
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                      <FileText className="h-3 w-3" />
                                      <span>{prescriptionNumber}</span>
                                      <span className="text-xs">• Dossier: {prescription.patient.fileNumber}</span>
                                    </div>
                                    
                                    {/* Diagnosis */}
                                    {prescription.diagnosis && (
                                      <p className="text-sm text-muted-foreground mt-1 truncate">
                                        <Pill className="h-3 w-3 inline mr-1" />
                                        {prescription.diagnosis}
                                      </p>
                                    )}

                                    {/* Medication count */}
                                    {prescription._count && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {prescription._count.items} médicament{prescription._count.items > 1 ? 's' : ''}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Status Badge */}
                                    <Badge 
                                      variant="outline" 
                                      className={cn('text-xs', statusStyle.bg, statusStyle.text)}
                                    >
                                      {statusStyle.label}
                                    </Badge>
                                    
                                    {/* Actions Dropdown */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                          <Link href={`/prescriptions/${prescription.id}`}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Voir détails
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDownloadPDF(
                                            prescription.id,
                                            `${prescription.patient.firstName}-${prescription.patient.lastName}`
                                          )}
                                          disabled={!prescription.isValid}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Télécharger PDF
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
