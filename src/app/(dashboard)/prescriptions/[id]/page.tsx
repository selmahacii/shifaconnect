
import * as React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileText, 
  User, 
  Calendar,
  Share2,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

async function getPrescription(id: string) {
  const supabase = await createClient()
  
  const { data: prescription, error } = await (supabase
    .from('prescriptions')
    .select(`
      *,
      patient:patients(*),
      doctor:doctors(*)
    `)
    .eq('id', id)
    .single() as any)

  if (error || !prescription) {
    return null
  }

  return prescription
}

export default async function PrescriptionDetailPage({ params }: { params: { id: string } }) {
  const prescription = await getPrescription(params.id)

  if (!prescription) {
    notFound()
  }

  const { patient, doctor } = prescription
  const date = new Date(prescription.created_at)
  const medications = prescription.medications as any[]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="text-slate-500 hover:text-slate-800">
          <Link href={`/dashboard/patients/${patient.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dossier patient
          </Link>
        </Button>
        <div className="flex gap-2">
          {prescription.pdf_url && (
            <Button asChild className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
              <a href={prescription.pdf_url} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </a>
            </Button>
          )}
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" className="text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-[#1B4F72] text-white rounded-t-xl py-8 px-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Ordonnance</h2>
                  </div>
                  <p className="opacity-80 font-mono text-xs">Réf: {prescription.id.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{format(date, 'dd/MM/yyyy')}</p>
                  <p className="opacity-80 text-xs">Date de délivrance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {/* Doctor Header (Simulation of paper header) */}
              <div className="flex justify-between border-b-2 border-slate-100 pb-8">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">Dr. {doctor.full_name}</h3>
                  <p className="text-sm text-slate-500">{doctor.speciality}</p>
                  <p className="text-xs text-slate-400">{doctor.clinic_address}, {doctor.clinic_wilaya}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">Patient: {patient.last_name} {patient.first_name}</p>
                  <p className="text-xs text-slate-500">Sexe: {patient.gender} • {calculateAge(patient.date_of_birth)} ans</p>
                </div>
              </div>

              {/* Medications list */}
              <div className="space-y-8 min-h-[400px]">
                {medications.map((med, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-300 font-bold text-lg">{idx + 1}.</span>
                      <h4 className="text-xl font-bold text-slate-900">
                        Rp/ {med.medicationName} <span className="text-slate-400 font-normal">{med.dosage}</span>
                      </h4>
                    </div>
                    <div className="pl-8 space-y-1">
                      <p className="text-slate-700 italic font-medium">
                        {med.form} — {med.frequency} pendant {med.duration}
                      </p>
                      <p className="text-xs text-slate-500">Quantité: {med.quantity}</p>
                      {med.instructions && (
                        <div className="mt-2 flex items-center gap-2 text-blue-700 bg-blue-50 w-fit px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                          <AlertCircle className="h-3 w-3" />
                          {med.instructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* General Instructions */}
              {prescription.instructions && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Instructions complémentaires</h4>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {prescription.instructions}
                  </p>
                </div>
              )}

              {/* Signature Area */}
              <div className="flex justify-end pt-10">
                <div className="text-center space-y-2">
                  <div className="h-24 w-32 border-2 border-dashed border-slate-100 rounded flex items-center justify-center">
                    <span className="text-[10px] text-slate-200 uppercase">Cachet & Signature</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">Dr. {doctor.full_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-bold">Actions de partage</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Partager par Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="mr-2 h-4 w-4" />
                Imprimer l'ordonnance
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-bold">Informations complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Validité</p>
                <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                  <Calendar className="h-4 w-4" />
                  Valable 3 mois
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Délivrée par</p>
                <p className="text-sm font-bold">Cabinet Médical {doctor.clinic_name || doctor.full_name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function calculateAge(birthDate: string) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
