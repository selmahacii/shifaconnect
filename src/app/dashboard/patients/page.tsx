
import { db } from '@/lib/db'
import { getCurrentDoctorId } from '@/lib/auth/server'
import { PatientListContent } from '@/components/patients/PatientListContent'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
  const doctorId = await getCurrentDoctorId()
  
  if (!doctorId) {
    redirect('/login')
  }

  try {
    // Fetch patients with their consultations
    const patientsRaw = await db.patient.findMany({
      where: { doctorId },
      include: {
        consultations: {
          select: { consultationDate: true },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { lastName: 'asc' }
    })

    // Transform data for the UI
    const patients = patientsRaw.map(p => {
      const lastVisit = p.consultations.length > 0 ? p.consultations[0].consultationDate : null

      return {
        id: p.id,
        first_name: p.firstName,
        last_name: p.lastName,
        first_name_ar: p.firstNameAr,
        last_name_ar: p.lastNameAr,
        date_of_birth: p.dateOfBirth,
        phone: p.phone,
        wilaya: p.wilaya,
        gender: (p.gender === 'MALE' ? 'M' : 'F') as 'M' | 'F',
        national_id: p.nin,
        chifa_number: p.chifaNumber,
        last_visit: lastVisit
      }
    })

    return <PatientListContent initialPatients={patients} />
  } catch (error) {
    console.error('Error fetching patients:', error)
    return <div>Erreur lors du chargement des patients</div>
  }
}
