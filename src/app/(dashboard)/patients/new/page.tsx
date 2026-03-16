import { PatientForm } from '@/components/patients/PatientForm'
import { Stethoscope } from 'lucide-react'

export default function NewPatientPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-[#1B4F72]" />
          Nouveau Patient
        </h1>
        <p className="text-slate-500 mt-1">
          Remplissez le dossier médical pour enregistrer un nouveau patient
        </p>
      </div>

      <PatientForm />
    </div>
  )
}
