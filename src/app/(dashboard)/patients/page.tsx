import { createClient } from '@/lib/supabase/server'
import { PatientListContent } from '@/components/patients/PatientListContent'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
  const supabase = await createClient()

  // Get current session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get doctor profile
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!doctor) {
    redirect('/login')
  }

  // Fetch patients with their last consultation date
  const { data: patientsData, error } = await supabase
    .from('patients')
    .select(`
      *,
      consultations (
        consultation_date
      )
    `)
    .eq('doctor_id', doctor.id)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching patients:', error)
  }

  // Transform data to get last_visit
  const patients = (patientsData || []).map(p => {
    const consultations = p.consultations as any[]
    const lastVisit = consultations.length > 0 
      ? consultations.reduce((latest, current) => 
          new Date(current.consultation_date) > new Date(latest.consultation_date) ? current : latest
        ).consultation_date 
      : null

    return {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      first_name_ar: p.first_name_ar,
      last_name_ar: p.last_name_ar,
      date_of_birth: p.date_of_birth,
      phone: p.phone,
      wilaya: p.wilaya,
      gender: p.gender,
      national_id: p.national_id,
      chifa_number: p.chifa_number,
      last_visit: lastVisit
    }
  })

  return <PatientListContent initialPatients={patients} />
}
