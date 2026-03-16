'use client'

import * as React from 'react'
import Link from 'next/link'
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, addDays, isWithinInterval, parse } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Filter,
  Stethoscope,
  TrendingUp,
  DollarSign,
  Users,
  ChevronRight,
  FileText,
  AlertTriangle,
  Heart,
  CalendarClock,
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

// Types
interface Patient {
  id: string
  firstName: string
  lastName: string
  fileNumber: string
  phone?: string | null
}

interface Vitals {
  systolicBP?: number | null
  diastolicBP?: number | null
}

interface Consultation {
  id: string
  consultationDate: string
  consultationTime: string | null
  chiefComplaint: string
  diagnosis: string | null
  icdCode: string | null
  status: string
  paid: boolean
  fee: number | null
  followUpDate: string | null
  vitals: Vitals | null
  patient: Patient
  prescriptions: { id: string }[]
}

interface ConsultationStats {
  todayCount: number
  todayRevenue: number
  pendingPayments: number
  monthCount: number
  monthRevenue: number
  bpAnomalyCount: number
  followUpPlannedCount: number
}

interface ConsultationsResponse {
  consultations: Consultation[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: ConsultationStats
}

// Status badge styles
const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Programmée' },
  IN_PROGRESS: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'En cours' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Terminée' },
  CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Annulée' },
  NO_SHOW: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', label: 'Absence' },
}

// Check if blood pressure is abnormal
function hasBPAnomaly(vitals: Vitals | null): boolean {
  if (!vitals?.systolicBP || !vitals?.diastolicBP) return false
  
  // Hypertension: systolic >= 140 or diastolic >= 90
  // Hypotension: systolic < 90 or diastolic < 60
  return (
    vitals.systolicBP >= 140 ||
    vitals.diastolicBP >= 90 ||
    vitals.systolicBP < 90 ||
    vitals.diastolicBP < 60
  )
}

// Get today's date in DD/MM/YYYY format
function getTodayDate(): string {
  return format(new Date(), 'dd/MM/yyyy')
}

// Parse date string DD/MM/YYYY
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

// Get date range based on filter
function getDateRange(filter: string): { startDate: Date; endDate: Date } | null {
  const today = new Date()
  
  switch (filter) {
    case 'today':
      return { startDate: today, endDate: today }
    case 'week':
      return { startDate: startOfWeek(today, { weekStartsOn: 0 }), endDate: endOfWeek(today, { weekStartsOn: 0 }) }
    case 'month':
      return { startDate: startOfMonth(today), endDate: endOfMonth(today) }
    default:
      return null
  }
}

export default function ConsultationsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [dateFilter, setDateFilter] = React.useState<string>('today')
  const [consultations, setConsultations] = React.useState<Consultation[]>([])
  const [stats, setStats] = React.useState<ConsultationStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Fetch consultations
  const fetchConsultations = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (dateFilter === 'today') {
        params.set('date', getTodayDate())
      }
      
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      
      if (searchQuery) {
        params.set('search', searchQuery)
      }
      
      params.set('stats', 'true')
      params.set('limit', '100')
      
      const response = await fetch(`/api/consultations?${params.toString()}`)
      
      if (!response.ok) throw new Error('Failed to fetch consultations')
      
      const data: ConsultationsResponse = await response.json()
      
      // Filter by date range if needed
      let filteredConsultations = data.consultations
      if (dateFilter !== 'today' && dateFilter !== 'all') {
        const dateRange = getDateRange(dateFilter)
        if (dateRange) {
          filteredConsultations = data.consultations.filter(c => {
            const consultDate = parseDateString(c.consultationDate)
            return isWithinInterval(consultDate, { start: dateRange.startDate, end: dateRange.endDate })
          })
        }
      }
      
      setConsultations(filteredConsultations)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching consultations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dateFilter, statusFilter, searchQuery])

  React.useEffect(() => {
    fetchConsultations()
  }, [fetchConsultations])

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchConsultations()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchConsultations])

  // Group consultations by date
  const groupedConsultations = React.useMemo(() => {
    const groups: Record<string, Consultation[]> = {}
    
    consultations.forEach(consultation => {
      const date = parseDateString(consultation.consultationDate)
      const displayKey = format(date, 'EEEE d MMMM yyyy', { locale: fr })
      
      if (!groups[displayKey]) {
        groups[displayKey] = []
      }
      groups[displayKey].push(consultation)
    })
    
    return groups
  }, [consultations])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Consultations
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les consultations et les dossiers médicaux
            </p>
          </div>
          <Link href="/patients">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle consultation
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aujourd&apos;hui
                </CardTitle>
                <Stethoscope className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayCount}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {stats.monthCount} ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recettes du jour
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Consultations payées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Impayés
                </CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  En attente de paiement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recettes du mois
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.monthRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total mensuel
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Anomalies TA
                </CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.bpAnomalyCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tension anormale
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Suivis planifiés
                </CardTitle>
                <CalendarClock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.followUpPlannedCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rendez-vous à venir
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
                  placeholder="Rechercher par patient, motif, diagnostic..."
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
                  <SelectItem value="all">Toutes les dates</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="SCHEDULED">Programmée</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminée</SelectItem>
                  <SelectItem value="CANCELLED">Annulée</SelectItem>
                  <SelectItem value="NO_SHOW">Absence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Consultations List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              Liste des consultations
            </CardTitle>
            <CardDescription>
              {consultations.length} consultation{consultations.length > 1 ? 's' : ''} trouvée{consultations.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune consultation trouvée</p>
                <Link href="/patients">
                  <Button variant="link" className="mt-2">
                    Créer une nouvelle consultation
                  </Button>
                </Link>
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <div className="px-6 pb-4 space-y-6">
                  {Object.entries(groupedConsultations).map(([date, dateConsultations]) => (
                    <div key={date} className="space-y-2">
                      {/* Date Header */}
                      <h3 className="text-sm font-medium text-muted-foreground capitalize sticky top-0 bg-card py-1 z-10">
                        {date}
                      </h3>
                      
                      {/* Consultations for this date */}
                      <div className="space-y-2">
                        {dateConsultations.map((consultation) => {
                          const statusStyle = statusStyles[consultation.status] || statusStyles.COMPLETED
                          const hasAnomaly = hasBPAnomaly(consultation.vitals)
                          
                          return (
                            <Link
                              key={consultation.id}
                              href={`/consultations/${consultation.id}`}
                              className="block"
                            >
                              <div className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group",
                                hasAnomaly && "border-l-4 border-l-orange-500"
                              )}>
                                {/* Time */}
                                {consultation.consultationTime && (
                                  <div className="text-sm font-mono font-medium text-primary min-w-[50px]">
                                    {consultation.consultationTime}
                                  </div>
                                )}
                                
                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      {/* Patient Name */}
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                          {consultation.patient.firstName} {consultation.patient.lastName}
                                        </p>
                                        {hasAnomaly && (
                                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        )}
                                      </div>
                                      
                                      {/* Chief Complaint */}
                                      <p className="text-sm text-muted-foreground truncate">
                                        {consultation.chiefComplaint}
                                      </p>
                                      
                                      {/* Diagnosis */}
                                      {consultation.diagnosis && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                          <FileText className="h-3 w-3 inline mr-1" />
                                          {consultation.diagnosis}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {/* Payment Status */}
                                      {!consultation.paid && (
                                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                                          Non payé
                                        </Badge>
                                      )}
                                      
                                      {/* Status Badge */}
                                      <Badge variant="outline" className={cn('text-xs', statusStyle.bg, statusStyle.text)}>
                                        {statusStyle.label}
                                      </Badge>
                                      
                                      {/* Has Prescription */}
                                      {consultation.prescriptions.length > 0 && (
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      
                                      {/* Has Follow-up */}
                                      {consultation.followUpDate && (
                                        <CalendarClock className="h-4 w-4 text-blue-500" />
                                      )}
                                      
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
                            </Link>
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
