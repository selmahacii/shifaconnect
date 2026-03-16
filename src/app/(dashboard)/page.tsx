'use client'

import * as React from 'react'
import {
  StatsCard,
  QuickActions,
  TodaysSchedule,
  ConsultationsChart,
  DiagnosticsChart,
  AgeDistributionChart,
  RecentPatientsCard,
} from '@/components/dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Stethoscope,
  Calendar,
  FileText,
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  monthConsultations: number
  todaysAppointments: {
    total: number
    remaining: number
  }
  monthPrescriptions: number
  consultationsByMonth: Array<{
    month: string
    count: number
  }>
  topDiagnostics: Array<{
    name: string
    count: number
  }>
  ageDistribution: Array<{
    name: string
    value: number
  }>
  recentPatients: Array<{
    id: string
    firstName: string
    lastName: string
    gender: 'MALE' | 'FEMALE'
    dateOfBirth: string
    phone?: string | null
    lastVisit?: string | null
    lastComplaint?: string | null
  }>
  upcomingAppointments: Array<{
    id: string
    patientId?: string
    patientName: string
    appointmentTime: string
    duration: number
    reason?: string
    status: string
  }>
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <Skeleton className="h-40 rounded-lg" />

      {/* Main Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[280px] rounded-lg" />
            <Skeleton className="h-[280px] rounded-lg" />
          </div>
          {/* Age Distribution */}
          <Skeleton className="h-[280px] rounded-lg" />
        </div>
        {/* Right Sidebar */}
        <div className="space-y-6">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[350px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-destructive">Erreur: {error}</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre espace de gestion médicale
        </p>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Patients totaux"
          value={stats.totalPatients}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Consultations ce mois-ci"
          value={stats.monthConsultations}
          icon={Stethoscope}
          variant="secondary"
        />
        <StatsCard
          title="Rendez-vous aujourd'hui"
          value={stats.todaysAppointments.total}
          icon={Calendar}
          variant="accent"
          trend={{
            value: stats.todaysAppointments.remaining,
            label: `${stats.todaysAppointments.remaining} restants`,
            direction: 'neutral' as const,
          }}
        />
        <StatsCard
          title="Ordonnances ce mois-ci"
          value={stats.monthPrescriptions}
          icon={FileText}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <ConsultationsChart data={stats.consultationsByMonth} />
            <DiagnosticsChart data={stats.topDiagnostics} />
          </div>

          {/* Age Distribution Chart */}
          <AgeDistributionChart data={stats.ageDistribution} />
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <TodaysSchedule
            appointments={stats.upcomingAppointments.map((apt) => ({
              id: apt.id,
              patientId: apt.patientId,
              patientName: apt.patientName,
              appointmentTime: apt.appointmentTime,
              duration: apt.duration,
              reason: apt.reason,
              status: apt.status as 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
            }))}
          />

          {/* Recent Patients */}
          <RecentPatientsCard patients={stats.recentPatients} />
        </div>
      </div>
    </div>
  )
}
