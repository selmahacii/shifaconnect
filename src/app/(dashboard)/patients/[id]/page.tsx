import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  ShieldCheck, 
  Droplet, 
  ArrowLeft,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PatientDetailTabs } from '../../../../components/patients/PatientDetailTabs'
import { ConsultationModal } from '@/components/consultations/ConsultationModal'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  // Get current session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch patient with consultations, prescriptions, and appointments
  const { data: patient, error } = (await supabase
    .from('patients')
    .select(`
      *,
      consultations (*),
      prescriptions (*),
      appointments (*)
    `)
    .eq('id', id)
    .single()) as any

  if (error || !patient) {
    notFound()
  }

  const getAge = (dateStr: string) => {
    try {
      const birthDate = new Date(dateStr)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/patients" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/patients/${id}/edit`}>
              <Settings className="mr-2 h-4 w-4" />
              Modifier le dossier
            </Link>
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-[#1B4F72] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold border-2 border-white/40">
                {patient.first_name[0]}{patient.last_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {patient.first_name} {patient.last_name}
                  </h1>
                  {patient.gender === 'F' ? (
                    <Badge className="bg-pink-500 hover:bg-pink-600 text-white rounded-full h-6 w-6 p-0 flex items-center justify-center">♀</Badge>
                  ) : (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-6 w-6 p-0 flex items-center justify-center">♂</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-white/80 text-sm">
                  {patient.first_name_ar && (
                    <span className="font-bold text-lg leading-none" dir="rtl">
                      {patient.first_name_ar} {patient.last_name_ar}
                    </span>
                  )}
                  <span>•</span>
                  <span>{getAge(patient.date_of_birth)} ans</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Droplet className="h-3 w-3" />
                    Groupe {patient.blood_group || 'Inconnu'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ConsultationModal 
                patientId={id} 
                patientName={`${patient.first_name} ${patient.last_name}`}
                trigger={
                  <Button className="bg-white text-[#1B4F72] hover:bg-white/90">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Nouvelle consultation
                  </Button>
                }
              />
              <Button asChild variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                <Link href={`/dashboard/agenda/new?patientId=${id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Nouveau rendez-vous
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-t">
            <div className="p-4 px-6 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Identifiant National (NIN)</p>
                <p className="font-semibold text-slate-700">{patient.national_id || '-'}</p>
              </div>
            </div>
            <div className="p-4 px-6 flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">C</div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Numéro de carte CHIFA</p>
                <p className="font-semibold text-slate-700">{patient.chifa_number || '-'}</p>
              </div>
            </div>
            <div className="p-4 px-6 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dernière visite</p>
                <p className="font-semibold text-slate-700">
                  {patient.consultations?.length > 0 
                    ? format(new Date(patient.consultations.sort((a: any, b: any) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime())[0].consultation_date), 'dd MMMM yyyy', { locale: fr })
                    : 'Aucune historique'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <PatientDetailTabs patient={patient} />
    </div>
  )
}
