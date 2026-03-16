
import * as React from 'react'
import { 
  StatsCard, 
  QuickActions, 
  TodaysSchedule, 
  ConsultationsChart, 
  DiagnosticsChart, 
  AgeDistributionChart,
  RecentPatientsCard 
} from '@/components/dashboard'
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { format, subMonths, startOfMonth, endOfMonth, parse } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const supabase = await createClient()
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const currentTimeStr = format(now, 'HH:mm')
  const firstOfMonth = format(startOfMonth(now), 'yyyy-MM-dd')
  const sixMonthsAgo = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd')

  const [
    { count: totalPatients },
    { count: monthConsultations },
    { data: todaysAppointmentsData },
    { count: monthPrescriptions },
    { data: last6MonthsConsultationsData },
    { data: thisMonthConsultationsData },
    { data: allPatientsBirthDatesData },
    { data: recentPatientsDataFetch }
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('consultation_date', firstOfMonth),
    supabase.from('appointments').select('*, patient:patients(*)').eq('appointment_date', today),
    supabase.from('prescriptions').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
    supabase.from('consultations').select('consultation_date').gte('consultation_date', sixMonthsAgo),
    supabase.from('consultations').select('diagnosis').gte('consultation_date', firstOfMonth),
    supabase.from('patients').select('date_of_birth'),
    supabase.from('patients').select('*, consultations!consultations_patient_id_fkey(chief_complaint, consultation_date)').order('created_at', { ascending: false }).limit(5)
  ])

  // Explicit type casts to avoid 'never' errors
  const appointments = (todaysAppointmentsData || []) as any[]
  const last6MonthsConsultations = (last6MonthsConsultationsData || []) as any[]
  const thisMonthConsultations = (thisMonthConsultationsData || []) as any[]
  const allPatientsBirthDates = (allPatientsBirthDatesData || []) as any[]
  const recentPatientsData = (recentPatientsDataFetch || []) as any[]

  // Process Today's Appointments
  const remainingAppointments = appointments.filter(a => a.appointment_time >= currentTimeStr && a.status !== 'CANCELLED' && a.status !== 'COMPLETED').length

  // Process Last 6 Months Chart
  const consultationsByMonth = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const monthName = format(monthDate, 'MMM', { locale: fr })
    const monthKey = format(monthDate, 'yyyy-MM')
    
    const count = last6MonthsConsultations.filter(c => 
      c.consultation_date && (c.consultation_date as string).startsWith(monthKey)
    ).length
    
    consultationsByMonth.push({ month: monthName, count })
  }

  // Process Top Diagnostics
  const diagnosisCounts: Record<string, number> = {}
  thisMonthConsultations.forEach(c => {
    if (c.diagnosis) {
      diagnosisCounts[c.diagnosis] = (diagnosisCounts[c.diagnosis] || 0) + 1
    }
  })
  const topDiagnostics = Object.entries(diagnosisCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Process Age Distribution
  const ageGroups = { '0-18 ans': 0, '19-40 ans': 0, '41-60 ans': 0, '60+ ans': 0 }
  allPatientsBirthDates.forEach(p => {
    if (!p.date_of_birth) return
    let birthDate: Date
    if (p.date_of_birth.includes('/')) {
        birthDate = parse(p.date_of_birth, 'dd/MM/yyyy', new Date())
    } else {
        birthDate = new Date(p.date_of_birth)
    }
    const age = now.getFullYear() - birthDate.getFullYear()
    if (age <= 18) ageGroups['0-18 ans']++
    else if (age <= 40) ageGroups['19-40 ans']++
    else if (age <= 60) ageGroups['41-60 ans']++
    else ageGroups['60+ ans']++
  })
  const ageDistribution = Object.entries(ageGroups).map(([name, value]) => ({ name, value }))

  // Process Recent Patients
  const recentPatients = recentPatientsData.map(p => ({
    id: p.id,
    firstName: p.first_name,
    lastName: p.last_name,
    gender: (p.gender || 'MALE') as 'MALE' | 'FEMALE',
    dateOfBirth: p.date_of_birth || '',
    phone: p.phone,
    lastVisit: p.consultations?.[0]?.consultation_date,
    lastComplaint: p.consultations?.[0]?.chief_complaint
  }))

  return {
    totalPatients: totalPatients || 0,
    monthConsultations: monthConsultations || 0,
    monthPrescriptions: monthPrescriptions || 0,
    todaysAppointments: {
      total: appointments.length,
      remaining: remainingAppointments
    },
    consultationsByMonth,
    topDiagnostics,
    ageDistribution,
    recentPatients,
    upcomingAppointments: appointments.map(a => ({
      id: a.id,
      patientId: a.patient_id,
      patientName: a.patient ? `${a.patient.first_name} ${a.patient.last_name}` : 'Patient inconnu',
      appointmentTime: a.appointment_time,
      duration: a.duration,
      reason: a.reason,
      status: a.status
    }))
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#1B4F72]">Tableau de bord</h1>
        <p className="text-slate-500">Bienvenue sur votre espace de gestion médicale</p>
      </div>

      {/* Stats Cards Row */}
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
            direction: 'neutral'
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

      {/* Charts & Widgets Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ConsultationsChart data={stats.consultationsByMonth} />
            <DiagnosticsChart data={stats.topDiagnostics} />
          </div>
          <AgeDistributionChart data={stats.ageDistribution} />
        </div>

        <div className="space-y-6">
          <TodaysSchedule appointments={stats.upcomingAppointments} />
          <RecentPatientsCard patients={stats.recentPatients} />
        </div>
      </div>
    </div>
  )
}
