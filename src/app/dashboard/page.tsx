
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
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-1.5 px-1">
            <h1 className="text-4xl font-black text-[#1B4F72] tracking-tighter italic uppercase">Mission Control</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#148F77] animate-pulse" />
                Tableau de bord de votre cabinet
            </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-3xl border border-slate-50 shadow-sm">
            <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{format(now, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                <span className="text-[10px] font-bold text-[#148F77] uppercase mt-0.5 tracking-tighter">Sessión Active</span>
            </div>
            <Badge className="bg-[#148F77]/10 text-[#148F77] border-[#148F77]/20 font-black px-4 py-2 rounded-2xl text-[10px] uppercase tracking-widest">
                En ligne
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

      {/* High-Level Monitoring Grid */}
      <div className="grid gap-8 xl:grid-cols-3">
        {/* Main Analytics Column */}
        <div className="xl:col-span-2 space-y-12">
          {/* Quick Actions at full width */}
          <section>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-2.5 w-2.5 rounded-full bg-[#148F77]" />
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Action Rapide</h2>
            </div>
            <QuickActions />
          </section>

          {/* Charts Row */}
          <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-2.5 w-2.5 rounded-full bg-[#1B4F72]" />
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Analyse de Flux</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <ConsultationsChart data={stats.consultationsByMonth} />
                <DiagnosticsChart data={stats.topDiagnostics} />
            </div>
          </section>

          {/* Demographics at bottom of main column */}
          <section>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-2.5 w-2.5 rounded-full bg-[#F39C12]" />
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Démographie</h2>
            </div>
            <AgeDistributionChart data={stats.ageDistribution} className="xl:max-w-md" />
          </section>
        </div>

        {/* Sidebar Tracking Column */}
        <div className="space-y-12">
          <section>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-2.5 w-2.5 rounded-full bg-[#1B4F72]" />
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Aujourd'hui</h2>
            </div>
            <TodaysSchedule initialAppointments={stats.upcomingAppointments} />
          </section>

          <section>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-2.5 w-2.5 rounded-full bg-[#1B4F72]" />
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Activité Dossiers</h2>
            </div>
            <RecentPatientsCard patients={stats.recentPatients} />
          </section>
        </div>
      </div>
    </div>
  )
}
