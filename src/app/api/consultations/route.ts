import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ConsultationStatus, PaymentMethod } from '@prisma/client'

// Type definitions
interface ConsultationStats {
  todayCount: number
  todayRevenue: number
  pendingPayments: number
  monthCount: number
  monthRevenue: number
  bpAnomalyCount: number
  followUpPlannedCount: number
}

// GET /api/consultations - List consultations
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    // Filters
    const date = searchParams.get('date') // DD/MM/YYYY format
    const patientId = searchParams.get('patientId')
    const doctorId = searchParams.get('doctorId')
    const status = searchParams.get('status') as ConsultationStatus | null
    const paid = searchParams.get('paid')
    const search = searchParams.get('search')
    
    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (date) {
      where.consultationDate = date
    }
    
    if (patientId) {
      where.patientId = patientId
    }
    
    if (doctorId) {
      where.doctorId = doctorId
    }
    
    if (status && Object.values(ConsultationStatus).includes(status)) {
      where.status = status
    }
    
    if (paid !== null && paid !== undefined) {
      where.paid = paid === 'true'
    }
    
    if (search) {
      where.OR = [
        { chiefComplaint: { contains: search } },
        { diagnosis: { contains: search } },
        { patient: { 
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { fileNumber: { contains: search } },
          ]
        }},
      ]
    }
    
    // Get total count for pagination
    const total = await db.consultation.count({ where })
    
    // Get consultations with relations
    const consultations = await db.consultation.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            fileNumber: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        doctor: {
          select: {
            id: true,
            professionalTitle: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        prescriptions: {
          select: {
            id: true,
            prescriptionDate: true,
          },
        },
      },
      orderBy: [
        { consultationDate: 'desc' },
        { consultationTime: 'desc' },
      ],
      skip,
      take: limit,
    })
    
    // Parse vitals for each consultation
    const parsedConsultations = consultations.map(c => ({
      ...c,
      vitals: c.vitals ? JSON.parse(c.vitals) : null,
    }))
    
    // Calculate stats if requested
    let stats: ConsultationStats | null = null
    const includeStats = searchParams.get('stats') === 'true'
    
    if (includeStats) {
      const today = new Date()
      const todayStr = today.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      
      const [todayCount, todayRevenue, pendingPayments, monthCount, monthRevenue, allConsultationsWithVitals, consultationsWithFollowUp] = await Promise.all([
        // Today's consultations count
        db.consultation.count({
          where: { consultationDate: todayStr },
        }),
        
        // Today's revenue (sum of fees for paid consultations)
        db.consultation.aggregate({
          where: { 
            consultationDate: todayStr,
            paid: true,
          },
          _sum: { fee: true },
        }),
        
        // Pending payments count
        db.consultation.count({
          where: { paid: false },
        }),
        
        // This month's consultations
        db.consultation.count({
          where: {
            consultationDate: { 
              startsWith: `${today.getMonth() + 1 < 10 ? '0' : ''}${today.getMonth() + 1}` 
            },
          },
        }),
        
        // This month's revenue
        db.consultation.aggregate({
          where: { paid: true },
          _sum: { fee: true },
        }),
        
        // Get all consultations with vitals for BP anomaly count
        db.consultation.findMany({
          where: {
            consultationDate: todayStr,
            vitals: { not: null },
          },
          select: {
            vitals: true,
          },
        }),
        
        // Follow-up planned count (consultations with future follow-up dates)
        db.consultation.count({
          where: {
            followUpDate: { not: null },
          },
        }),
      ])
      
      // Calculate BP anomaly count
      let bpAnomalyCount = 0
      allConsultationsWithVitals.forEach(c => {
        if (c.vitals) {
          try {
            const vitals = JSON.parse(c.vitals)
            const systolic = vitals.systolicBP
            const diastolic = vitals.diastolicBP
            
            // Check for hypertension or hypotension
            if (systolic && diastolic) {
              if (systolic >= 140 || diastolic >= 90 || systolic < 90 || diastolic < 60) {
                bpAnomalyCount++
              }
            }
          } catch {
            // Ignore parsing errors
          }
        }
      })
      
      stats = {
        todayCount,
        todayRevenue: todayRevenue._sum.fee || 0,
        pendingPayments,
        monthCount,
        monthRevenue: monthRevenue._sum.fee || 0,
        bpAnomalyCount,
        followUpPlannedCount: consultationsWithFollowUp,
      }
    }
    
    return NextResponse.json({
      consultations: parsedConsultations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching consultations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des consultations' },
      { status: 500 }
    )
  }
}

// POST /api/consultations - Create consultation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.patientId) {
      return NextResponse.json(
        { error: 'Le patient est requis' },
        { status: 400 }
      )
    }
    
    if (!body.chiefComplaint) {
      return NextResponse.json(
        { error: 'Le motif de consultation est requis' },
        { status: 400 }
      )
    }
    
    // Get doctor ID (in a real app, this would come from auth)
    // For now, we'll use the first doctor or require it in the body
    let doctorId = body.doctorId
    
    if (!doctorId) {
      const doctor = await db.doctor.findFirst()
      if (!doctor) {
        return NextResponse.json(
          { error: 'Aucun médecin trouvé. Veuillez créer un profil médecin.' },
          { status: 400 }
        )
      }
      doctorId = doctor.id
    }
    
    // Verify patient exists
    const patient = await db.patient.findUnique({
      where: { id: body.patientId },
    })
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      )
    }
    
    // Prepare vitals JSON
    const vitalsData = body.vitals ? JSON.stringify(body.vitals) : null
    
    // Create consultation
    const consultation = await db.consultation.create({
      data: {
        doctorId,
        patientId: body.patientId,
        consultationDate: body.consultationDate || new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        consultationTime: body.consultationTime || new Date().toTimeString().slice(0, 5),
        chiefComplaint: body.chiefComplaint,
        chiefComplaintAr: body.chiefComplaintAr,
        presentIllness: body.presentIllness,
        presentIllnessAr: body.presentIllnessAr,
        examinationNotes: body.examinationNotes,
        examinationNotesAr: body.examinationNotesAr,
        diagnosis: body.diagnosis,
        diagnosisAr: body.diagnosisAr,
        icdCode: body.icdCode,
        treatmentPlan: body.treatmentPlan,
        treatmentPlanAr: body.treatmentPlanAr,
        followUpDate: body.followUpDate,
        followUpNotes: body.followUpNotes,
        vitals: vitalsData,
        fee: body.fee || 2000,
        paid: body.paid || false,
        paymentMethod: body.paymentMethod as PaymentMethod,
        notes: body.notes,
        status: body.status as ConsultationStatus || 'COMPLETED',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fileNumber: true,
          },
        },
      },
    })
    
    return NextResponse.json(consultation, { status: 201 })
  } catch (error) {
    console.error('Error creating consultation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la consultation' },
      { status: 500 }
    )
  }
}
