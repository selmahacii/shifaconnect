'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppointmentCalendar } from '@/components/agenda/AppointmentCalendar'
import { TodaysScheduleWidget } from '@/components/agenda/TodaysScheduleWidget'

// Types
interface Appointment {
  id: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  reason?: string | null
  status: string
  patient?: {
    id: string
    firstName: string
    lastName: string
    fileNumber: string
    gender: string
  } | null
}

export default function AgendaPage() {
  const router = useRouter()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Fetch today's appointments for stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = format(new Date(), 'dd/MM/yyyy')
        const response = await fetch(`/api/appointments?date=${today}&limit=100`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments || [])
        }
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  // Calculate stats
  const stats = React.useMemo(() => {
    const scheduled = appointments.filter(a => a.status === 'SCHEDULED').length
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
    const completed = appointments.filter(a => a.status === 'COMPLETED').length
    const cancelled = appointments.filter(a => a.status === 'CANCELLED').length
    const noShow = appointments.filter(a => a.status === 'NO_SHOW').length
    return { scheduled, confirmed, completed, cancelled, noShow, total: appointments.length }
  }, [appointments])

  // Handle start consultation
  const handleStartConsultation = (patientId: string) => {
    router.push(`/consultations/new?patientId=${patientId}`)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-primary" />
              Agenda
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos rendez-vous et votre planning
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Programmés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
              <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Terminés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Annulés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
              <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Rendez-vous</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <AppointmentCalendar />
          </div>

          {/* Today's Schedule Widget */}
          <div className="lg:col-span-1">
            <TodaysScheduleWidget 
              onStartConsultation={handleStartConsultation}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
