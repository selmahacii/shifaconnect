'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  AlertCircle,
  FileText as PrescriptionIcon,
  Upload,
  TestTube,
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getInitials, getAgeFromBirthDate, formatCurrency } from '@/lib/utils'
import { ConsultationVitalsCard, ConsultationActionsBar } from '@/components/consultations'

// Types
interface Vitals {
  systolicBP?: number | null
  diastolicBP?: number | null
  temperature?: number | null
  pulse?: number | null
  weight?: number | null
  height?: number | null
  bmi?: number | null
  oxygenSaturation?: number | null
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  firstNameAr?: string | null
  lastNameAr?: string | null
  fileNumber: string
  phone?: string | null
  phoneSecondary?: string | null
  email?: string | null
  dateOfBirth: string
  gender: string
  bloodType?: string | null
  allergies?: string | null
  chronicDiseases?: string | null
  address?: string | null
  city?: string | null
  wilaya?: string | null
}

interface Doctor {
  id: string
  professionalTitle?: string | null
  specialization?: string | null
  clinicName?: string | null
  clinicPhone?: string | null
  address?: string | null
  city?: string | null
  wilaya?: string | null
  user: {
    name: string
  }
}

interface PrescriptionItem {
  id: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string | null
}

interface Prescription {
  id: string
  prescriptionDate: string
  diagnosis?: string | null
  notes?: string | null
  items: PrescriptionItem[]
}

interface MedicalDocument {
  id: string
  documentType: string
  title: string
  documentDate?: string | null
  description?: string | null
}

interface Consultation {
  id: string
  consultationDate: string
  consultationTime?: string | null
  chiefComplaint: string
  chiefComplaintAr?: string | null
  presentIllness?: string | null
  presentIllnessAr?: string | null
  examinationNotes?: string | null
  examinationNotesAr?: string | null
  diagnosis?: string | null
  diagnosisAr?: string | null
  icdCode?: string | null
  treatmentPlan?: string | null
  treatmentPlanAr?: string | null
  followUpDate?: string | null
  followUpNotes?: string | null
  vitals: Vitals | null
  fee?: number | null
  paid: boolean
  paymentMethod?: string | null
  notes?: string | null
  status: string
  patient: Patient
  doctor: Doctor
  prescriptions: Prescription[]
  medicalDocuments?: MedicalDocument[]
}

// Status styles
const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Programmée' },
  IN_PROGRESS: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'En cours' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Terminée' },
  CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Annulée' },
  NO_SHOW: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', label: 'Absence' },
}

// Payment method labels
const paymentMethodLabels: Record<string, string> = {
  CASH: 'Espèces',
  CARD: 'Carte bancaire',
  CHEQUE: 'Chèque',
  INSURANCE: 'Assurance',
  FREE: 'Gratuit',
}

// Document type labels
const documentTypeLabels: Record<string, string> = {
  LAB_RESULT: 'Résultat d\'analyse',
  XRAY: 'Radiographie',
  MRI: 'IRM',
  CT_SCAN: 'Scanner',
  ULTRASOUND: 'Échographie',
  REPORT: 'Rapport médical',
  REFERRAL: 'Lettre de orientation',
  CERTIFICATE: 'Certificat médical',
  OTHER: 'Autre',
}

// Gender labels
const genderLabels: Record<string, string> = {
  MALE: 'Masculin',
  FEMALE: 'Féminin',
}

// Blood type labels
const bloodTypeLabels: Record<string, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
}

// Parse date string DD/MM/YYYY
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

export default function ConsultationDetailPage() {
  const params = useParams()
  const consultationId = params.id as string
  
  const [consultation, setConsultation] = React.useState<Consultation | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Fetch consultation details
  React.useEffect(() => {
    const fetchConsultation = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/consultations/${consultationId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Consultation non trouvée')
          } else {
            setError('Erreur lors du chargement de la consultation')
          }
          return
        }
        
        const data = await response.json()
        setConsultation(data)
      } catch (err) {
        console.error('Error fetching consultation:', err)
        setError('Erreur lors du chargement de la consultation')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchConsultation()
  }, [consultationId])
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    )
  }
  
  if (error || !consultation) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link href="/consultations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux consultations
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error || 'Consultation non trouvée'}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    )
  }
  
  const statusStyle = statusStyles[consultation.status] || statusStyles.COMPLETED
  const patientAge = getAgeFromBirthDate(consultation.patient.dateOfBirth)
  const patientInitials = getInitials(consultation.patient.firstName, consultation.patient.lastName)
  const consultationDate = parseDateString(consultation.consultationDate)
  
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/consultations">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Consultation du {format(consultationDate, 'd MMMM yyyy', { locale: fr })}
              </h1>
              <p className="text-muted-foreground">
                Dossier: {consultation.patient.fileNumber}
              </p>
            </div>
            <Badge variant="outline" className={cn('text-sm', statusStyle.bg, statusStyle.text)}>
              {statusStyle.label}
            </Badge>
          </div>
          
          {/* Actions Bar */}
          <ConsultationActionsBar
            consultationId={consultation.id}
            patientId={consultation.patient.id}
            hasPrescriptions={consultation.prescriptions.length > 0}
          />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Patient Sidebar */}
          <div className="space-y-4">
            {/* Patient Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient Avatar and Name */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {patientInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {consultation.patient.firstName} {consultation.patient.lastName}
                    </p>
                    {consultation.patient.firstNameAr && consultation.patient.lastNameAr && (
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        {consultation.patient.firstNameAr} {consultation.patient.lastNameAr}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {patientAge} ans • {genderLabels[consultation.patient.gender] || consultation.patient.gender}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Patient Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dossier:</span>
                    <span className="font-medium">{consultation.patient.fileNumber}</span>
                  </div>
                  
                  {consultation.patient.bloodType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Groupe sanguin:</span>
                      <Badge variant="secondary">
                        {bloodTypeLabels[consultation.patient.bloodType] || consultation.patient.bloodType}
                      </Badge>
                    </div>
                  )}
                  
                  {consultation.patient.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${consultation.patient.phone}`} className="hover:text-primary">
                        {consultation.patient.phone}
                      </a>
                    </div>
                  )}
                  
                  {consultation.patient.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${consultation.patient.email}`} className="hover:text-primary truncate">
                        {consultation.patient.email}
                      </a>
                    </div>
                  )}
                  
                  {(consultation.patient.city || consultation.patient.wilaya) && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <span>{consultation.patient.city}{consultation.patient.city && consultation.patient.wilaya && ', '}{consultation.patient.wilaya}</span>
                    </div>
                  )}
                </div>
                
                {/* Allergies Alert */}
                {consultation.patient.allergies && (
                  <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-600">Allergies</AlertTitle>
                    <AlertDescription className="text-red-600/80">
                      {consultation.patient.allergies}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Chronic Diseases */}
                {consultation.patient.chronicDiseases && (
                  <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-600">Maladies chroniques</AlertTitle>
                    <AlertDescription className="text-orange-600/80">
                      {consultation.patient.chronicDiseases}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/patients/${consultation.patient.id}`}>
                    Voir le dossier patient
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Doctor Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Médecin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">
                  {consultation.doctor.professionalTitle} {consultation.doctor.user.name}
                </p>
                {consultation.doctor.specialization && (
                  <p className="text-muted-foreground">{consultation.doctor.specialization}</p>
                )}
                {consultation.doctor.clinicName && (
                  <p className="text-muted-foreground">{consultation.doctor.clinicName}</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="space-y-4">
            {/* Date and Time */}
            <Card className="border-border/50">
              <CardContent className="py-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="capitalize">{format(consultationDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                  </div>
                  {consultation.consultationTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{consultation.consultationTime}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Vitals */}
            <ConsultationVitalsCard vitals={consultation.vitals} />
            
            {/* Chief Complaint */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Motif de consultation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{consultation.chiefComplaint}</p>
                {consultation.chiefComplaintAr && (
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap" dir="rtl">
                    {consultation.chiefComplaintAr}
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Present Illness History */}
            {consultation.presentIllness && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Histoire de la maladie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{consultation.presentIllness}</p>
                  {consultation.presentIllnessAr && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap" dir="rtl">
                      {consultation.presentIllnessAr}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Examination Notes */}
            {consultation.examinationNotes && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-secondary" />
                    Examen clinique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{consultation.examinationNotes}</p>
                  {consultation.examinationNotesAr && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap" dir="rtl">
                      {consultation.examinationNotesAr}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Diagnosis */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Diagnostic
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consultation.diagnosis ? (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{consultation.diagnosis}</p>
                    {consultation.diagnosisAr && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap" dir="rtl">
                        {consultation.diagnosisAr}
                      </p>
                    )}
                    {consultation.icdCode && (
                      <Badge variant="secondary" className="mt-3">
                        CIM-10: {consultation.icdCode}
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Aucun diagnostic enregistré</p>
                )}
              </CardContent>
            </Card>
            
            {/* Treatment Plan */}
            {consultation.treatmentPlan && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Plan de traitement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{consultation.treatmentPlan}</p>
                  {consultation.treatmentPlanAr && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap" dir="rtl">
                      {consultation.treatmentPlanAr}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Follow-up */}
            {consultation.followUpDate && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Suivi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Prochain rendez-vous: {format(parseDateString(consultation.followUpDate), 'd MMMM yyyy', { locale: fr })}
                  </p>
                  {consultation.followUpNotes && (
                    <p className="text-sm text-muted-foreground mt-2">{consultation.followUpNotes}</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Prescriptions */}
            {consultation.prescriptions.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PrescriptionIcon className="h-4 w-4 text-primary" />
                    Ordonnances ({consultation.prescriptions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {consultation.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="rounded-lg border border-border/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">
                          {format(parseDateString(prescription.prescriptionDate), 'd MMMM yyyy', { locale: fr })}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/prescriptions/${prescription.id}`}>
                            Voir l&apos;ordonnance
                          </Link>
                        </Button>
                      </div>
                      
                      {prescription.diagnosis && (
                        <p className="text-sm mb-2">{prescription.diagnosis}</p>
                      )}
                      
                      <div className="space-y-2">
                        {prescription.items.map((item) => (
                          <div key={item.id} className="text-sm p-2 rounded bg-muted/50">
                            <p className="font-medium">{item.medicationName}</p>
                            <p className="text-muted-foreground">
                              {item.dosage} • {item.frequency} • {item.duration}
                            </p>
                            {item.instructions && (
                              <p className="text-muted-foreground text-xs mt-1">{item.instructions}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Lab Results / Medical Documents */}
            {consultation.medicalDocuments && consultation.medicalDocuments.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-primary" />
                    Résultats de laboratoire ({consultation.medicalDocuments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {consultation.medicalDocuments.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/documents/${doc.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {documentTypeLabels[doc.documentType] || doc.documentType}
                            {doc.documentDate && ` • ${format(parseDateString(doc.documentDate), 'd MMMM yyyy', { locale: fr })}`}
                          </p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Payment */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Honoraires</p>
                    <p className="text-lg font-semibold">
                      {consultation.fee ? formatCurrency(consultation.fee) : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={consultation.paid ? 'default' : 'outline'} className={cn(
                      consultation.paid 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    )}>
                      {consultation.paid ? 'Payé' : 'Non payé'}
                    </Badge>
                    {consultation.paymentMethod && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {paymentMethodLabels[consultation.paymentMethod] || consultation.paymentMethod}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Notes */}
            {consultation.notes && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{consultation.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
