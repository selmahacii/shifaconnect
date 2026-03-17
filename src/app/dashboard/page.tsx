
import * as React from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { 
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
  FileText,
  Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import { getCurrentDoctorId } from '@/lib/auth/server'
import { format, subMonths, startOfMonth, endOfMonth, parse } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const doctorId = await getCurrentDoctorId()
  if (!doctorId) {
    return null
  }

  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const currentTimeStr = format(now, 'HH:mm')
  const firstOfMonth = startOfMonth(now)
  const sixMonthsAgo = startOfMonth(subMonths(now, 5))

  const [
    totalPatients,
    monthConsultationsCount,
    appointments,
    monthPrescriptionsCount,
    last6MonthsConsultationsRaw,
    thisMonthConsultationsRaw,
    allPatientsBirthDatesRaw,
    recentPatientsRaw
  ] = await Promise.all([
    db.patient.count({ where: { doctorId } }),
    db.consultation.count({ 
      where: { 
        doctorId,
        createdAt: { gte: firstOfMonth }
      } 
    }),
    db.appointment.findMany({ 
      where: { 
        doctorId,
        appointmentDate: todayStr 
      },
      include: { patient: true },
      orderBy: { appointmentTime: 'asc' }
    }),
    db.prescription.count({ 
      where: { 
        doctorId,
        createdAt: { gte: firstOfMonth }
      } 
    }),
    db.consultation.findMany({ 
      where: { 
        doctorId,
        createdAt: { gte: sixMonthsAgo }
      },
      select: { createdAt: true }
    }),
    db.consultation.findMany({ 
      where: { 
        doctorId,
        createdAt: { gte: firstOfMonth }
      },
      select: { diagnosis: true }
    }),
    db.patient.findMany({ 
      where: { doctorId },
      select: { dateOfBirth: true }
    }),
    db.patient.findMany({ 
      where: { doctorId },
      include: { 
        consultations: { 
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { chiefComplaint: true, consultationDate: true }
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  // Process Last 6 Months Chart
  const consultationsByMonth: Array<{ month: string; count: number }> = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const monthName = format(monthDate, 'MMM', { locale: fr })
    const monthKey = format(monthDate, 'yyyy-MM')
    
    const count = last6MonthsConsultationsRaw.filter(c => 
      format(c.createdAt, 'yyyy-MM') === monthKey
    ).length
    
    consultationsByMonth.push({ month: monthName, count })
  }

  // Process Top Diagnostics
  const diagnosisCounts: Record<string, number> = {}
  thisMonthConsultationsRaw.forEach(c => {
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
  allPatientsBirthDatesRaw.forEach(p => {
    if (!p.dateOfBirth) return
    let birthDate: Date
    if (p.dateOfBirth.includes('/')) {
        birthDate = parse(p.dateOfBirth, 'dd/MM/yyyy', new Date())
    } else {
        birthDate = new Date(p.dateOfBirth)
    }
    const age = now.getFullYear() - birthDate.getFullYear()
    if (age <= 18) ageGroups['0-18 ans']++
    else if (age <= 40) ageGroups['19-40 ans']++
    else if (age <= 60) ageGroups['41-60 ans']++
    else ageGroups['60+ ans']++
  })
  const ageDistribution = Object.entries(ageGroups).map(([name, value]) => ({ name, value }))

  // Process Recent Patients
  const recentPatients = recentPatientsRaw.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    gender: (p.gender || 'MALE') as 'MALE' | 'FEMALE',
    dateOfBirth: p.dateOfBirth || '',
    phone: p.phone,
    lastVisit: p.consultations?.[0]?.consultationDate,
    lastComplaint: p.consultations?.[0]?.chiefComplaint
  }))

  const remainingAppointments = appointments.filter(a => a.appointmentTime >= currentTimeStr && a.status !== 'CANCELLED' && a.status !== 'COMPLETED').length

  return {
    totalPatients,
    monthConsultations: monthConsultationsCount,
    monthPrescriptions: monthPrescriptionsCount,
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
      patientId: a.patientId,
      patientName: a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Patient inconnu',
      appointmentTime: a.appointmentTime,
      duration: a.duration,
      reason: a.reason,
      status: a.status
    }))
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardData()
  const now = new Date()

  if (!stats) {
    return <div>Chargement...</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#1B4F72] tracking-tight">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">
            Bienvenue, Dr. {format(now, 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-white shadow-sm border-slate-200 text-[#1B4F72] font-semibold">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-[#148F77]" />
            Système en ligne
          </Badge>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Patients totaux"
          value={stats.totalPatients}
          icon={<Users className="h-5 w-5" />}
          variant="primary"
          trend={{ value: 12, direction: 'up', label: 'vs mois dernier' }}
        />
        <StatsCard
          title="Consultations"
          value={stats.monthConsultations}
          icon={<Stethoscope className="h-5 w-5" />}
          variant="secondary"
          trend={{ value: 8, direction: 'up', label: 'ce mois-ci' }}
        />
        <StatsCard
          title="Rendez-vous"
          value={stats.todaysAppointments.total}
          icon={<Calendar className="h-5 w-5" />}
          variant="accent"
          trend={{
            value: stats.todaysAppointments.remaining,
            label: `${stats.todaysAppointments.remaining} restants`,
            direction: 'neutral'
          }}
        />
        <StatsCard
          title="Ordonnances"
          value={stats.monthPrescriptions}
          icon={<FileText className="h-5 w-5" />}
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <QuickActions />
          
          <div className="grid gap-6 md:grid-cols-2">
            <ConsultationsChart data={stats.consultationsByMonth} />
            <DiagnosticsChart data={stats.topDiagnostics} />
          </div>
          
          <AgeDistributionChart data={stats.ageDistribution} />
        </div>

        <div className="space-y-8">
          <TodaysSchedule appointments={stats.upcomingAppointments} />
          <RecentPatientsCard patients={stats.recentPatients} />
        </div>
      </div>
    </div>
  )
}
