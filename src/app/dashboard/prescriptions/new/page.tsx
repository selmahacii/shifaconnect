
import * as React from 'react'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, FileText, User } from 'lucide-react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PrescriptionForm } from '@/components/prescriptions/PrescriptionForm'

export default async function NewPrescriptionPage({ 
  searchParams 
}: { 
  searchParams: { patientId?: string, consultationId?: string } 
}) {
  const patientId = searchParams.patientId
  const consultationId = searchParams.consultationId

  if (!patientId) {
    redirect('/dashboard/patients')
  }

  const supabase = await createClient()
  
  // Fetch patient details
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single()

  if (error || !patient) {
    notFound()
  }

  // Optional: Fetch consultation context if exists to pre-fill something or show as info
  let consultation = null
  if (consultationId) {
    const { data } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single()
    consultation = data
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="text-slate-500 hover:text-slate-800">
          <Link href={`/dashboard/patients/${patientId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dossier patient
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#1B4F72]" />
          <h1 className="text-2xl font-bold text-slate-900">Nouvelle Ordonnance</h1>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <User className="h-3 w-3" />
          <span>Patient: <strong>{patient.last_name} {patient.first_name}</strong></span>
          {consultation && (
            <>
              <span className="text-slate-300">|</span>
              <span>Consultation du {new Date(consultation.created_at).toLocaleDateString('fr-FR')}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border p-6 md:p-8">
          <PrescriptionForm 
            patientId={patientId} 
            patientName={`${patient.first_name} ${patient.last_name}`}
            consultationId={consultationId}
          />
        </div>
      </div>
    </div>
  )
}
