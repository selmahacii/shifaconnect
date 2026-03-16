import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { formatDate, getDayName, getMonthName } from '@/lib/utils/dates'
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns'

// GET /api/dashboard/stats - Get all dashboard statistics
export async function GET() {
  try {
    // Get today's date in DD/MM/YYYY format
    const today = formatDate(new Date())
    const currentMonth = format(new Date(), 'MM')
    const currentYear = format(new Date(), 'yyyy')
    
    // Get first and last day of current month
    const monthStart = format(startOfMonth(new Date()), 'dd/MM/yyyy')
    const monthEnd = format(endOfMonth(new Date()), 'dd/MM/yyyy')

    // Run all stats queries in parallel for performance
    const [
      totalPatients,
      todaysAppointments,
      todaysAppointmentsList,
      monthConsultations,
      monthPrescriptions,
      recentPatients,
      upcomingAppointments,
      last6MonthsConsultations,
      topDiagnostics,
      allPatients
    ] = await Promise.all([
      // 1. Total patients count
      db.patient.count({
        where: { isActive: true },
      }),

      // 2. Today's appointments count
      db.appointment.count({
        where: {
          appointmentDate: today,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
      }),

      // 3. Today's appointments list (to calculate remaining)
      db.appointment.findMany({
        where: {
          appointmentDate: today,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { appointmentTime: 'asc' },
        include: {
          patient: {
            select: { firstName: true, lastName: true, id: true },
          },
        },
      }),

      // 4. This month's consultations count
      db.consultation.count({
        where: {
          consultationDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),

      // 5. This month's prescriptions count
      db.prescription.count({
        where: {
          prescriptionDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),

      // 6. Recent patients (last 5 with consultation info)
      db.patient.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gender: true,
          dateOfBirth: true,
          phone: true,
          updatedAt: true,
          consultations: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              chiefComplaint: true,
              consultationDate: true,
            },
          },
        },
      }),

      // 7. Upcoming appointments for today's schedule widget
      db.appointment.findMany({
        take: 10,
        where: {
          appointmentDate: today,
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        },
        orderBy: { appointmentTime: 'asc' },
        include: {
          patient: {
            select: { firstName: true, lastName: true, id: true },
          },
        },
      }),

      // 8. Last 6 months consultations for chart
      db.consultation.findMany({
        select: {
          consultationDate: true,
        },
      }),

      // 9. Top diagnostics - get all diagnoses and process manually
      db.consultation.findMany({
        where: {
          diagnosis: { not: '' },
          consultationDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: { diagnosis: true },
      }),

      // 10. All patients for age distribution
      db.patient.findMany({
        select: { dateOfBirth: true },
        where: { isActive: true },
      }),
    ])

    // Calculate remaining appointments for today
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    
    const remainingAppointments = todaysAppointmentsList.filter(apt => {
      return apt.appointmentTime >= currentTimeStr
    }).length

    // Process last 6 months consultations data
    const last6MonthsData: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthName = getMonthName(date, 'fr')
      const monthStart = format(startOfMonth(date), 'dd/MM/yyyy')
      const monthEnd = format(endOfMonth(date), 'dd/MM/yyyy')
      
      const count = last6MonthsConsultations.filter(c => 
        c.consultationDate >= monthStart && c.consultationDate <= monthEnd
      ).length
      
      last6MonthsData.push({ month: monthName, count })
    }

    // Process top diagnostics - count manually
    const diagnosisCounts: Record<string, number> = {}
    topDiagnostics.forEach(c => {
      if (c.diagnosis && c.diagnosis.trim()) {
        diagnosisCounts[c.diagnosis] = (diagnosisCounts[c.diagnosis] || 0) + 1
      }
    })
    
    const diagnosticsData = Object.entries(diagnosisCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate age distribution
    const ageGroups = {
      '0-18 ans': 0,
      '19-40 ans': 0,
      '41-60 ans': 0,
      '60+ ans': 0,
    }

    allPatients.forEach(patient => {
      const age = calculateAge(patient.dateOfBirth)
      if (age <= 18) ageGroups['0-18 ans']++
      else if (age <= 40) ageGroups['19-40 ans']++
      else if (age <= 60) ageGroups['41-60 ans']++
      else ageGroups['60+ ans']++
    })

    const ageDistributionData = Object.entries(ageGroups).map(([name, value]) => ({
      name,
      value,
    }))

    // Format response
    const stats = {
      // Stats cards data
      totalPatients,
      monthConsultations,
      todaysAppointments: {
        total: todaysAppointments,
        remaining: remainingAppointments,
      },
      monthPrescriptions,
      
      // Charts data
      consultationsByMonth: last6MonthsData,
      topDiagnostics: diagnosticsData,
      ageDistribution: ageDistributionData,
      
      // Widgets data
      recentPatients: recentPatients.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth,
        phone: p.phone,
        lastVisit: p.consultations[0]?.consultationDate || null,
        lastComplaint: p.consultations[0]?.chiefComplaint || null,
      })),
      
      upcomingAppointments: upcomingAppointments.map(a => ({
        id: a.id,
        patientId: a.patient?.id,
        patientName: a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Patient inconnu',
        appointmentTime: a.appointmentTime,
        duration: a.duration,
        reason: a.reason,
        status: a.status,
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

// Helper function to calculate age from DD/MM/YYYY date string
function calculateAge(dateString: string): number {
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
