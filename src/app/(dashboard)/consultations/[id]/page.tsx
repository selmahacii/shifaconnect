
import * as React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Printer, 
  Edit, 
  Trash2, 
  User,
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'

async function getConsultation(id: string) {
  const supabase = await createClient()
  
  const { data: consultation, error } = await (supabase
    .from('consultations')
    .select(`
      *,
      patient:patients(*),
      doctor:doctors(*)
    `)
    .eq('id', id)
    .single() as any)

  if (error || !consultation) {
    return null
  }

  // Also fetch prescription if it exists
  const { data: prescription } = await (supabase
    .from('prescriptions')
    .select('*')
    .eq('consultation_id', id)
    .single() as any)

  return { ...consultation, prescription }
}

export default async function ConsultationDetailPage({ params }: { params: { id: string } }) {
  const consultation = await getConsultation(params.id)

  if (!consultation) {
    notFound()
  }

  const { patient, doctor, prescription } = consultation
  const consultationDate = new Date(consultation.created_at)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Breadcrumbs / Back button */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="text-slate-500 hover:text-slate-800">
          <Link href={`/dashboard/patients/${patient.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dossier patient
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-xl border p-6 shadow-sm border-l-4 border-l-[#1B4F72]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-[#1B4F72] border-blue-200">
                Consultation #{consultation.id.slice(0, 8)}
              </Badge>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                Terminée
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(consultationDate, 'PPP', { locale: fr })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(consultationDate, 'HH:mm')}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Dr. {doctor.full_name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#1B4F72]" />
                Détails de la consultation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Motif */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#1B4F72]">Motif de consultation</h3>
                <p className="p-4 bg-slate-50 rounded-lg text-slate-800 border border-slate-100 italic">
                  "{consultation.chief_complaint}"
                </p>
              </div>

              {/* Symptoms */}
              {consultation.symptoms && (
                <div className="space-y-3">
                  <h3 className="font-bold text-[#1B4F72]">Symptômes rapportés</h3>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {consultation.symptoms}
                  </p>
                </div>
              )}

              <Separator />

              {/* Diagnosis */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#1B4F72]">Examen & Diagnostic</h3>
                  {consultation.diagnosis_code && (
                    <Badge variant="secondary" className="bg-slate-100">
                      CIM-10: {consultation.diagnosis_code}
                    </Badge>
                  )}
                </div>
                <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl bg-blue-50/30">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Conclusion Diagnostique</h4>
                  <p className="text-lg font-medium text-slate-900">
                    {consultation.diagnosis}
                  </p>
                </div>
              </div>

              {/* Clinical Notes */}
              {consultation.clinical_notes && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-[#1B4F72]">Notes cliniques</h3>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {consultation.clinical_notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          {/* Vitals */}
          <Card>
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-md flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#1B4F72]" />
                Examen Clinique
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <VitalItem 
                  icon={<Heart className="h-4 w-4 text-red-500" />}
                  label="Tension"
                  value={consultation.blood_pressure_systolic && consultation.blood_pressure_diastolic 
                    ? `${consultation.blood_pressure_systolic}/${consultation.blood_pressure_diastolic}` 
                    : '--'}
                  unit="mmHg"
                />
                <VitalItem 
                  icon={<Activity className="h-4 w-4 text-blue-500" />}
                  label="Fréq. C"
                  value={consultation.heart_rate || '--'}
                  unit="bpm"
                />
                <VitalItem 
                  icon={<Thermometer className="h-4 w-4 text-orange-500" />}
                  label="Tempé."
                  value={consultation.temperature || '--'}
                  unit="°C"
                />
                <VitalItem 
                  icon={<Activity className="h-4 w-4 text-green-500" />}
                  label="Sat. O2"
                  value={consultation.oxygen_saturation || '--'}
                  unit="%"
                />
                <VitalItem 
                  icon={<Weight className="h-4 w-4 text-slate-500" />}
                  label="Poids"
                  value={consultation.weight || '--'}
                  unit="kg"
                />
                <VitalItem 
                  icon={<Ruler className="h-4 w-4 text-slate-500" />}
                  label="Taille"
                  value={consultation.height || '--'}
                  unit="cm"
                />
              </div>
              
              {consultation.weight && consultation.height && (
                <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">IMC calculé</p>
                    <p className="text-xl font-bold text-slate-900">
                      {(consultation.weight / ((consultation.height / 100) ** 2)).toFixed(1)}
                    </p>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    (consultation.weight / ((consultation.height / 100) ** 2)) > 25 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                  )}>
                    {(consultation.weight / ((consultation.height / 100) ** 2)) > 25 ? "Surpoids" : "Normal"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-up */}
          <Card>
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-md flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#1B4F72]" />
                Suivi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {consultation.followup_date ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Prochain rendez-vous :</p>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-[#1B4F72] border border-blue-100">
                    <Calendar className="h-4 w-4" />
                    <span className="font-bold">
                      {format(new Date(consultation.followup_date), 'PPP', { locale: fr })}
                    </span>
                  </div>
                  {consultation.followup_notes && (
                    <p className="text-sm text-slate-600 italic mt-2">
                      Notes: {consultation.followup_notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-2 italic">
                  Aucun suivi planifié
                </p>
              )}
            </CardContent>
          </Card>

          {/* Related Prescription */}
          <Card>
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-md flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#1B4F72]" />
                Ordonnance liée
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {prescription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 text-xs">Réf: {prescription.id.slice(0, 8)}</span>
                    <Badge variant="outline" className="text-[10px] h-5">N° {prescription.prescription_number || '--'}</Badge>
                  </div>
                  <Button asChild className="w-full bg-[#1B4F72] hover:bg-[#1B4F72]/90 h-9 text-xs">
                    <Link href={`/dashboard/prescriptions/${prescription.id}`}>
                      Voir l'ordonnance
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-sm text-slate-500 italic">
                    Aucune ordonnance émise
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full h-8 text-[11px]">
                    <Link href={`/dashboard/prescriptions/new?patientId=${patient.id}&consultationId=${consultation.id}`}>
                      Créer une ordonnance
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function VitalItem({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: any, unit: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-slate-800">{value}</span>
        <span className="text-[10px] text-slate-500">{unit}</span>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
