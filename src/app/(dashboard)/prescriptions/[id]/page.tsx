'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Printer,
  Download,
  Edit,
  Trash2,
  FileText,
  Calendar,
  User,
  Pill,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
  Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { getAgeFromBirthDate } from '@/lib/utils/dates'

interface MedicationItem {
  id: string
  medicationName: string
  medicationNameAr?: string | null
  dosage: string
  frequency: string
  frequencyAr?: string | null
  duration: string
  durationAr?: string | null
  quantity?: number | null
  instructions?: string | null
  instructionsAr?: string | null
  order: number
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  firstNameAr?: string | null
  lastNameAr?: string | null
  fileNumber: string
  dateOfBirth: string
  gender: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  bloodType?: string | null
  allergies?: string | null
}

interface Doctor {
  id: string
  professionalTitle?: string | null
  specialization?: string | null
  licenseNumber?: string | null
  clinicName?: string | null
  address?: string | null
  city?: string | null
  clinicPhone?: string | null
  user: {
    name: string
  }
}

interface Consultation {
  id: string
  consultationDate: string
  consultationTime?: string | null
  chiefComplaint: string
  diagnosis?: string | null
  icdCode?: string | null
}

interface Prescription {
  id: string
  prescriptionDate: string
  diagnosis?: string | null
  notes?: string | null
  isValid: boolean
  createdAt: string
  patient: Patient
  doctor: Doctor
  consultation?: Consultation | null
  items: MedicationItem[]
}

export default function PrescriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const prescriptionId = params.id as string

  const [prescription, setPrescription] = React.useState<Prescription | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch prescription data
  React.useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/prescriptions/${prescriptionId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Ordonnance non trouvée')
          } else {
            setError('Erreur lors du chargement de l\'ordonnance')
          }
          return
        }

        const data = await response.json()
        setPrescription(data)
      } catch (err) {
        console.error('Error fetching prescription:', err)
        setError('Erreur lors du chargement de l\'ordonnance')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrescription()
  }, [prescriptionId])

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/pdf`)

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ordonnance-${prescription?.patient.lastName}-${prescription?.prescriptionDate.replace(/\//g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (err) {
      console.error('Error downloading PDF:', err)
      alert('Erreur lors du téléchargement du PDF')
    }
  }

  // Handle print (opens PDF in new tab)
  const handlePrint = () => {
    window.open(`/api/prescriptions/${prescriptionId}/pdf`, '_blank')
  }

  // Handle void (soft delete)
  const handleVoid = async () => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation')
      }

      router.push('/patients')
    } catch (err) {
      console.error('Error voiding prescription:', err)
      alert('Erreur lors de l\'annulation de l\'ordonnance')
    } finally {
      setIsDeleting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de l&apos;ordonnance...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !prescription) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux patients
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Ordonnance non trouvée'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const patientAge = getAgeFromBirthDate(prescription.patient.dateOfBirth)
  const patientName = `${prescription.patient.firstName} ${prescription.patient.lastName}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href={`/patients/${prescription.patient.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au patient
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ordonnance</h1>
            <p className="text-muted-foreground">
              Créée le {prescription.prescriptionDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!prescription.isValid && (
            <Badge variant="destructive">Annulée</Badge>
          )}
          <Button variant="outline" onClick={handlePrint} disabled={!prescription.isValid}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} disabled={!prescription.isValid}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
          {prescription.isValid && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/prescriptions/${prescription.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Annuler l&apos;ordonnance</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir annuler cette ordonnance ? Cette action est irréversible.
                      L&apos;ordonnance sera marquée comme invalide mais ne sera pas supprimée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleVoid}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirmer l&apos;annulation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invalid Warning */}
          {!prescription.isValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cette ordonnance a été annulée et n&apos;est plus valide.
              </AlertDescription>
            </Alert>
          )}

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Diagnostic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{prescription.diagnosis}</p>
              </CardContent>
            </Card>
          )}

          {/* Medications */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                Médicaments
              </CardTitle>
              <CardDescription>
                {prescription.items.length} médicament(s) prescrit(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescription.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      index % 2 === 0 ? 'bg-muted/30' : 'bg-background'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-primary">
                          {index + 1}. {item.medicationName}
                        </h4>
                        {item.medicationNameAr && (
                          <p className="text-sm text-muted-foreground" dir="rtl">
                            {item.medicationNameAr}
                          </p>
                        )}
                      </div>
                      {item.quantity && (
                        <Badge variant="outline">
                          <Hash className="h-3 w-3 mr-1" />
                          {item.quantity} unités
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">
                        <Pill className="h-3 w-3 mr-1" />
                        {item.dosage}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.frequency}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.duration}
                      </Badge>
                    </div>

                    {item.instructions && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {item.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {prescription.notes && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{prescription.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{patientName}</p>
                {prescription.patient.firstNameAr && prescription.patient.lastNameAr && (
                  <p className="text-sm text-muted-foreground" dir="rtl">
                    {prescription.patient.firstNameAr} {prescription.patient.lastNameAr}
                  </p>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Âge:</span>
                <span>{patientAge} ans</span>
                <span className="text-muted-foreground">Date de naissance:</span>
                <span>{prescription.patient.dateOfBirth}</span>
                <span className="text-muted-foreground">N° Dossier:</span>
                <span>{prescription.patient.fileNumber}</span>
              </div>
              {prescription.patient.phone && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tél: </span>
                    {prescription.patient.phone}
                  </div>
                </>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/patients/${prescription.patient.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir le dossier
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Info */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Médecin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">
                {prescription.doctor.professionalTitle || 'Dr.'} {prescription.doctor.user.name}
              </p>
              {prescription.doctor.specialization && (
                <p className="text-muted-foreground">{prescription.doctor.specialization}</p>
              )}
              {prescription.doctor.clinicName && (
                <p className="text-muted-foreground">{prescription.doctor.clinicName}</p>
              )}
              {prescription.doctor.licenseNumber && (
                <p className="text-muted-foreground text-xs italic">
                  N° Ordre: {prescription.doctor.licenseNumber}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Related Consultation */}
          {prescription.consultation && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Consultation associée</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Date: </span>
                  {prescription.consultation.consultationDate}
                  {prescription.consultation.consultationTime && (
                    <span> à {prescription.consultation.consultationTime}</span>
                  )}
                </div>
                <p className="text-sm">{prescription.consultation.chiefComplaint}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/consultations/${prescription.consultation.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir la consultation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card className="border-border/50">
            <CardContent className="pt-4 text-xs text-muted-foreground space-y-1">
              <p>Créée le: {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}</p>
              <p>ID: {prescription.id}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
