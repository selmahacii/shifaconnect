'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  Droplets,
  FileText,
  Calendar,
  HelpCircle,
  ChevronRight,
  Loader2,
  Pill,
  Clock,
  Upload,
} from 'lucide-react'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'

// Form schema
const newConsultationSchema = z.object({
  // Section 1 - Motif
  chiefComplaint: z.string().min(1, 'Le motif de consultation est requis'),
  presentIllness: z.string().optional(),

  // Section 2 - Examen clinique (Constantes)
  vitals: z.object({
    systolicBP: z.coerce.number().min(60).max(250).optional().or(z.literal('')),
    diastolicBP: z.coerce.number().min(40).max(150).optional().or(z.literal('')),
    pulse: z.coerce.number().min(30).max(220).optional().or(z.literal('')),
    temperature: z.coerce.number().min(30).max(45).optional().or(z.literal('')),
    weight: z.coerce.number().min(1).max(500).optional().or(z.literal('')),
    height: z.coerce.number().min(50).max(250).optional().or(z.literal('')),
    oxygenSaturation: z.coerce.number().min(50).max(100).optional().or(z.literal('')),
  }).optional(),

  // Section 3 - Diagnostic
  diagnosis: z.string().min(1, 'Le diagnostic est requis'),
  icdCode: z.string().optional(),
  examinationNotes: z.string().optional(),

  // Section 4 - Suivi
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),

  // Section 5 - Actions rapides
  createPrescription: z.boolean().default(false),
  scheduleFollowUp: z.boolean().default(false),
  uploadLabResult: z.boolean().default(false),
})

type NewConsultationFormValues = z.infer<typeof newConsultationSchema>

interface Patient {
  id: string
  firstName: string
  lastName: string
  firstNameAr?: string | null
  lastNameAr?: string | null
  dateOfBirth: string
  gender: string
  bloodType?: string | null
  fileNumber: string
}

interface NewConsultationDialogProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (consultationId: string, createPrescription: boolean) => void
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

// Calculate age from date of birth (DD/MM/YYYY)
function calculateAge(dateOfBirth: string): number {
  const [day, month, year] = dateOfBirth.split('/').map(Number)
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Format today's date as DD/MM/YYYY
function getTodayDate(): string {
  const today = new Date()
  return format(today, 'dd/MM/yyyy')
}

// Format current time as HH:mm
function getCurrentTime(): string {
  return format(new Date(), 'HH:mm')
}

export function NewConsultationDialog({
  patient,
  open,
  onOpenChange,
  onSuccess,
}: NewConsultationDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [currentSection, setCurrentSection] = React.useState(1)

  const form = useForm<NewConsultationFormValues>({
    resolver: zodResolver(newConsultationSchema),
    defaultValues: {
      chiefComplaint: '',
      presentIllness: '',
      vitals: {
        systolicBP: undefined,
        diastolicBP: undefined,
        pulse: undefined,
        temperature: undefined,
        weight: undefined,
        height: undefined,
        oxygenSaturation: undefined,
      },
      diagnosis: '',
      icdCode: '',
      examinationNotes: '',
      followUpDate: '',
      followUpNotes: '',
      createPrescription: false,
      scheduleFollowUp: false,
      uploadLabResult: false,
    },
  })

  // Calculate BMI
  const weight = form.watch('vitals.weight')
  const height = form.watch('vitals.height')
  const bmi = React.useMemo(() => {
    if (weight && height && Number(height) > 0) {
      const heightM = Number(height) / 100
      const bmiValue = Number(weight) / (heightM * heightM)
      return bmiValue.toFixed(1)
    }
    return null
  }, [weight, height])

  // Get BMI category
  const getBMICategory = (bmiValue: number | null): { label: string; color: string } => {
    if (!bmiValue) return { label: '', color: '' }
    if (bmiValue < 18.5) return { label: 'Insuffisance pondérale', color: 'text-blue-500' }
    if (bmiValue < 25) return { label: 'Poids normal', color: 'text-green-500' }
    if (bmiValue < 30) return { label: 'Surpoids', color: 'text-yellow-500' }
    if (bmiValue < 35) return { label: 'Obésité modérée', color: 'text-orange-500' }
    return { label: 'Obésité sévère', color: 'text-red-500' }
  }

  const bmiCategory = getBMICategory(bmi ? parseFloat(bmi) : null)

  // Handle form submission
  const onSubmit = async (data: NewConsultationFormValues) => {
    try {
      setIsSubmitting(true)

      // Prepare vitals data
      const vitalsData = {
        systolicBP: data.vitals?.systolicBP ? Number(data.vitals.systolicBP) : null,
        diastolicBP: data.vitals?.diastolicBP ? Number(data.vitals.diastolicBP) : null,
        pulse: data.vitals?.pulse ? Number(data.vitals.pulse) : null,
        temperature: data.vitals?.temperature ? Number(data.vitals.temperature) : null,
        weight: data.vitals?.weight ? Number(data.vitals.weight) : null,
        height: data.vitals?.height ? Number(data.vitals.height) : null,
        oxygenSaturation: data.vitals?.oxygenSaturation ? Number(data.vitals.oxygenSaturation) : null,
        bmi: bmi ? parseFloat(bmi) : null,
      }

      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          consultationDate: getTodayDate(),
          consultationTime: getCurrentTime(),
          chiefComplaint: data.chiefComplaint,
          presentIllness: data.presentIllness,
          diagnosis: data.diagnosis,
          icdCode: data.icdCode,
          examinationNotes: data.examinationNotes,
          followUpDate: data.followUpDate,
          followUpNotes: data.followUpNotes,
          vitals: vitalsData,
          status: 'COMPLETED',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création de la consultation')
      }

      const consultation = await response.json()

      toast({
        title: 'Consultation créée',
        description: 'La consultation a été enregistrée avec succès.',
      })

      // Close dialog
      onOpenChange(false)
      form.reset()
      setCurrentSection(1)

      // Handle quick actions
      if (data.createPrescription && onSuccess) {
        onSuccess(consultation.id, true)
        router.push(`/prescriptions/new?patientId=${patient.id}&consultationId=${consultation.id}`)
      } else if (data.scheduleFollowUp) {
        router.push(`/agenda?patientId=${patient.id}`)
      } else if (onSuccess) {
        onSuccess(consultation.id, false)
      }
    } catch (error) {
      console.error('Error creating consultation:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigate to next section
  const nextSection = () => {
    // Validate current section before proceeding
    let fieldsToValidate: (keyof NewConsultationFormValues)[] = []

    if (currentSection === 1) {
      fieldsToValidate = ['chiefComplaint']
    } else if (currentSection === 3) {
      fieldsToValidate = ['diagnosis']
    }

    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid && currentSection < 5) {
        setCurrentSection(currentSection + 1)
      }
    })
  }

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1)
    }
  }

  const patientAge = calculateAge(patient.dateOfBirth)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Nouvelle consultation
          </DialogTitle>
          <DialogDescription>
            Créer une nouvelle consultation pour ce patient
          </DialogDescription>
        </DialogHeader>

        {/* Patient Info Card */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
          <div>
            <p className="font-medium">
              {patient.firstName} {patient.lastName}
              {patient.firstNameAr && patient.lastNameAr && (
                <span className="text-muted-foreground mr-2" dir="rtl">
                  {' '}({patient.firstNameAr} {patient.lastNameAr})
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Dossier: {patient.fileNumber} • {patientAge} ans
            </p>
          </div>
          <div className="flex items-center gap-2">
            {patient.bloodType && (
              <Badge variant="secondary">
                {bloodTypeLabels[patient.bloodType] || patient.bloodType}
              </Badge>
            )}
            <Badge variant="outline">
              {patient.gender === 'MALE' ? 'M' : 'F'}
            </Badge>
          </div>
        </div>

        {/* Section Progress */}
        <div className="flex items-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((section) => (
            <React.Fragment key={section}>
              <button
                type="button"
                onClick={() => setCurrentSection(section)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  currentSection === section
                    ? 'bg-primary text-primary-foreground'
                    : currentSection > section
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {section}
              </button>
              {section < 5 && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    currentSection > section ? 'bg-primary/20' : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Section 1 - Motif */}
            {currentSection === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Motif de consultation</h3>
                </div>

                <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Motif de consultation <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormDescription>
                        Pourquoi consulte-t-il aujourd&apos;hui?
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Douleurs abdominales, fièvre depuis 3 jours..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="presentIllness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptômes et histoire de la maladie</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez l'évolution des symptômes, les traitements essayés..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Section 2 - Examen clinique */}
            {currentSection === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Examen clinique (Constantes vitales)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tous les champs sont optionnels
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Blood Pressure */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Tension artérielle
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="vitals.systolicBP"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Syst."
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-muted-foreground">/</span>
                        <FormField
                          control={form.control}
                          name="vitals.diastolicBP"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Diast."
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm text-muted-foreground">mmHg</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pulse */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-pink-500" />
                        Fréquence cardiaque
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="vitals.pulse"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="72"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm text-muted-foreground">bpm</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Temperature */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        Température
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="vitals.temperature"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="37.0"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm text-muted-foreground">°C</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weight & Height */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Scale className="h-4 w-4 text-blue-500" />
                        Poids
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="vitals.weight"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="70"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm text-muted-foreground">kg</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-purple-500" />
                        Taille
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="vitals.height"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="175"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm text-muted-foreground">cm</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* BMI */}
                  {bmi && (
                    <Card className="border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">IMC (calculé)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-2xl font-bold', bmiCategory.color)}>
                            {bmi}
                          </span>
                          <span className="text-sm text-muted-foreground">kg/m²</span>
                        </div>
                        <p className={cn('text-xs mt-1', bmiCategory.color)}>
                          {bmiCategory.label}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Oxygen Saturation */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        Saturation O₂
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="vitals.oxygenSaturation"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="98"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Section 3 - Diagnostic */}
            {currentSection === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Diagnostic</h3>
                </div>

                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Diagnostic <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Diagnostic principal et diagnostics secondaires..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icdCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Code CIM-10
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                Le Code International des Maladies (CIM-10) est un système de classification
                                des maladies et problèmes de santé connexes. Ex: J00 pour rhume commun,
                                K29 pour gastrite.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: J00, K29.7, E11.9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="examinationNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes cliniques</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observations, examens complémentaires demandés, remarques..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Section 4 - Suivi */}
            {currentSection === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Suivi</h3>
                </div>

                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de suivi</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="JJ/MM/AAAA"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Date du prochain rendez-vous de suivi (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes de suivi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Instructions pour le prochain rendez-vous, examens à faire avant..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Section 5 - Actions rapides */}
            {currentSection === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Actions rapides</h3>
                </div>

                <Card className="border-border/50">
                  <CardContent className="pt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="createPrescription"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <Pill className="h-4 w-4 text-primary" />
                              Créer une ordonnance après cette consultation
                            </FormLabel>
                            <FormDescription>
                              Rediriger vers le formulaire d&apos;ordonnance avec les informations pré-remplies
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="scheduleFollowUp"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <Clock className="h-4 w-4 text-primary" />
                              Planifier un rendez-vous de suivi
                            </FormLabel>
                            <FormDescription>
                              Ajouter un rendez-vous dans l&apos;agenda
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="uploadLabResult"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <Upload className="h-4 w-4 text-primary" />
                              Uploader un résultat de labo
                            </FormLabel>
                            <FormDescription>
                              Ajouter un document médical (analyse, imagerie...)
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter className="flex justify-between pt-4 border-t">
              <div className="flex gap-2">
                {currentSection > 1 && (
                  <Button type="button" variant="outline" onClick={prevSection}>
                    Précédent
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                {currentSection < 5 ? (
                  <Button type="button" onClick={nextSection}>
                    Suivant
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer la consultation
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
