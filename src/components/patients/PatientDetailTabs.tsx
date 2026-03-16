'use client'

import * as React from 'react'
import { 
  History, 
  FileText, 
  FlaskConical, 
  Calendar as CalendarIcon, 
  ClipboardList,
  AlertCircle,
  Activity,
  Pill,
  Download,
  Eye,
  Plus,
  Stethoscope,
  ChevronRight
} from 'lucide-react'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ConsultationModal } from '@/components/consultations/ConsultationModal'

interface PatientDetailTabsProps {
  patient: any
}

export function PatientDetailTabs({ patient }: PatientDetailTabsProps) {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="bg-white p-1 h-auto flex-wrap md:flex-nowrap border">
        <TabsTrigger value="summary" className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-100">
          <ClipboardList className="h-4 w-4" />
          <span className="hidden md:inline">Résumé médical</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-100">
          <History className="h-4 w-4" />
          <span className="hidden md:inline">Historique consultations</span>
        </TabsTrigger>
        <TabsTrigger value="prescriptions" className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-100">
          <FileText className="h-4 w-4" />
          <span className="hidden md:inline">Ordonnances</span>
        </TabsTrigger>
        <TabsTrigger value="lab" className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-100">
          <FlaskConical className="h-4 w-4" />
          <span className="hidden md:inline">Résultats labo</span>
        </TabsTrigger>
        <TabsTrigger value="agenda" className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-100">
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden md:inline">Agenda</span>
        </TabsTrigger>
      </TabsList>

      {/* TAB 1: SUMMARY */}
      <TabsContent value="summary" className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Allergies */}
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-red-700">Allergies</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patient.allergies?.length > 0 ? (
                  patient.allergies.map((a: string) => (
                    <Badge key={a} variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                      {a}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucune allergie signalée</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chronic Conditions */}
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-orange-700">Maladies chroniques</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patient.chronic_conditions?.length > 0 ? (
                  patient.chronic_conditions.map((c: string) => (
                    <Badge key={c} variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucune maladie chronique</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Medications */}
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-blue-700">Médicaments actuels</CardTitle>
              <Pill className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patient.current_medications?.length > 0 ? (
                  patient.current_medications.map((m: string) => (
                    <Badge key={m} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                      {m}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucun traitement en cours</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Notes */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Notes médecin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {patient.notes || 'Aucune note particulière pour ce patient.'}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 2: CONSULTATIONS HISTORY */}
      <TabsContent value="history" className="mt-6">
        <div className="space-y-4">
           <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Historique des visites</h3>
            <ConsultationModal 
              patientId={patient.id} 
              patientName={`${patient.first_name} ${patient.last_name}`}
              trigger={
                <Button size="sm" className="bg-[#1B4F72]">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle consultation
                </Button>
              }
            />
          </div>

          <div className="space-y-4">
            {patient.consultations?.length > 0 ? (
              patient.consultations
                .sort((a: any, b: any) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime())
                .map((c: any) => (
                  <Card key={c.id} className="hover:border-[#1B4F72]/30 transition-colors">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-[#1B4F72] shrink-0 border">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {format(new Date(c.consultation_date || c.created_at), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                          <p className="text-sm text-slate-500 font-medium">Motif: {c.chief_complaint || c.motif || 'N/A'}</p>
                          {c.diagnosis && (
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">Diagnostic</Badge>
                              <span className="text-sm text-slate-700">{c.diagnosis}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="text-[#1B4F72] hover:text-[#1B4F72] hover:bg-[#1B4F72]/5 shrink-0">
                        <Link href={`/dashboard/consultations/${c.id}`}>
                          Détails <ChevronRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2">
                Aucune consultation enregistrée
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* TAB 3: PRESCRIPTIONS */}
      <TabsContent value="prescriptions" className="mt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Ordonnances</h3>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/prescriptions/new?patientId=${patient.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle ordonnance
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.prescriptions?.length > 0 ? (
              patient.prescriptions
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((p: any) => (
                  <Card key={p.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Ord. N° {p.prescription_number || p.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500">{format(new Date(p.created_at), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-[#1B4F72]">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-[#1B4F72]">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2">
                Aucune ordonnance émise
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* TAB 4: LAB RESULTS */}
      <TabsContent value="lab" className="mt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Analyses & Imagerie</h3>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un résultat
            </Button>
          </div>
          <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2">
            Aucun résultat de laboratoire importé
          </div>
        </div>
      </TabsContent>

      {/* TAB 5: AGENDA */}
      <TabsContent value="agenda" className="mt-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Prochains rendez-vous</h3>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/agenda/new?patientId=${patient.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Planifier
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {patient.appointments?.filter((a: any) => new Date(a.appointment_date) >= new Date()).length > 0 ? (
              patient.appointments
                .filter((a: any) => new Date(a.appointment_date) >= new Date())
                .map((a: any) => (
                  <Card key={a.id} className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center h-12 w-12 bg-blue-50 rounded text-blue-700">
                          <span className="text-[10px] uppercase font-bold">{format(new Date(a.appointment_date), 'MMM', { locale: fr })}</span>
                          <span className="text-lg font-bold leading-none">{format(new Date(a.appointment_date), 'dd')}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{a.appointment_time}</p>
                          <p className="text-sm text-slate-500">{a.reason || 'Consultation de suivi'}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Prévu</Badge>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2">
                Aucun rendez-vous à venir
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-700">Historique des rendez-vous</h4>
            {patient.appointments?.filter((a: any) => new Date(a.appointment_date) < new Date()).slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="font-bold">{format(new Date(a.appointment_date), 'dd/MM/yyyy')}</span>
                  <span>-</span>
                  <span>{a.reason || 'Consultation'}</span>
                </div>
                <Badge variant="outline" className="text-[10px] lowercase text-slate-400">{a.status || 'terminé'}</Badge>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
