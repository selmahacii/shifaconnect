'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  User,
  Stethoscope,
  FileText,
  Calendar,
  CreditCard,
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Separator } from '@/components/ui/separator'
import { VitalsInput, type VitalsData } from './VitalsInput'
import type { Patient, Consultation } from '@prisma/client'

// Form schema
const vitalsSchema = z.object({
  systolicBP: z.number().min(60).max(250).nullable().optional(),
  diastolicBP: z.number().min(40).max(150).nullable().optional(),
  temperature: z.number().min(30).max(45).nullable().optional(),
  pulse: z.number().min(30).max(200).nullable().optional(),
  weight: z.number().min(1).max(500).nullable().optional(),
  height: z.number().min(50).max(250).nullable().optional(),
  bmi: z.number().nullable().optional(),
})

const consultationFormSchema = z.object({
  patientId: z.string().min(1, 'Le patient est requis'),
  consultationDate: z.string().min(1, 'La date est requise'),
  consultationTime: z.string().optional(),
  chiefComplaint: z.string().min(1, 'Le motif de consultation est requis'),
  chiefComplaintAr: z.string().optional(),
  presentIllness: z.string().optional(),
  presentIllnessAr: z.string().optional(),
  examinationNotes: z.string().optional(),
  examinationNotesAr: z.string().optional(),
  diagnosis: z.string().optional(),
  diagnosisAr: z.string().optional(),
  icdCode: z.string().optional(),
  treatmentPlan: z.string().optional(),
  treatmentPlanAr: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  vitals: vitalsSchema.optional(),
  fee: z.number().min(0).optional(),
  paid: z.boolean().default(false),
  paymentMethod: z.enum(['CASH', 'CARD', 'CHEQUE', 'INSURANCE', 'FREE']).nullable().optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('COMPLETED'),
})

export type ConsultationFormData = z.infer<typeof consultationFormSchema>

// Payment method options
const paymentMethods = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'CARD', label: 'Carte bancaire' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'INSURANCE', label: 'Assurance' },
  { value: 'FREE', label: 'Gratuit' },
]

// Status options
const statusOptions = [
  { value: 'SCHEDULED', label: 'Programmée', color: 'bg-blue-500' },
  { value: 'IN_PROGRESS', label: 'En cours', color: 'bg-orange-500' },
  { value: 'COMPLETED', label: 'Terminée', color: 'bg-green-500' },
  { value: 'CANCELLED', label: 'Annulée', color: 'bg-red-500' },
  { value: 'NO_SHOW', label: 'Absence', color: 'bg-gray-500' },
]

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  fileNumber: string
}

interface ConsultationFormProps {
  patients?: PatientOption[]
  selectedPatient?: PatientOption
  defaultValues?: Partial<ConsultationFormData>
  onSubmit: (data: ConsultationFormData) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
  isLoading?: boolean
  className?: string
}

export function ConsultationForm({
  patients = [],
  selectedPatient,
  defaultValues,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
  className,
}: ConsultationFormProps) {
  const [showArabicFields, setShowArabicFields] = React.useState(false)
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    vitals: true,
    history: true,
    examination: true,
    diagnosis: true,
    treatment: true,
    payment: true,
  })
  const [patientSearch, setPatientSearch] = React.useState('')
  const [showPatientPicker, setShowPatientPicker] = React.useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Get today's date in DD/MM/YYYY format
  const today = format(new Date(), 'dd/MM/yyyy')
  const currentTime = format(new Date(), 'HH:mm')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      patientId: selectedPatient?.id || defaultValues?.patientId || '',
      consultationDate: defaultValues?.consultationDate || today,
      consultationTime: defaultValues?.consultationTime || currentTime,
      chiefComplaint: defaultValues?.chiefComplaint || '',
      chiefComplaintAr: defaultValues?.chiefComplaintAr || '',
      presentIllness: defaultValues?.presentIllness || '',
      presentIllnessAr: defaultValues?.presentIllnessAr || '',
      examinationNotes: defaultValues?.examinationNotes || '',
      examinationNotesAr: defaultValues?.examinationNotesAr || '',
      diagnosis: defaultValues?.diagnosis || '',
      diagnosisAr: defaultValues?.diagnosisAr || '',
      icdCode: defaultValues?.icdCode || '',
      treatmentPlan: defaultValues?.treatmentPlan || '',
      treatmentPlanAr: defaultValues?.treatmentPlanAr || '',
      followUpDate: defaultValues?.followUpDate || '',
      followUpNotes: defaultValues?.followUpNotes || '',
      vitals: defaultValues?.vitals || {},
      fee: defaultValues?.fee || 2000,
      paid: defaultValues?.paid || false,
      paymentMethod: defaultValues?.paymentMethod || 'CASH',
      notes: defaultValues?.notes || '',
      status: defaultValues?.status || 'COMPLETED',
    },
  })

  // Set patient when selected from picker
  React.useEffect(() => {
    if (selectedPatient) {
      setValue('patientId', selectedPatient.id)
    }
  }, [selectedPatient, setValue])

  const watchedPatientId = watch('patientId')
  const selectedPatientInfo = patients.find(p => p.id === watchedPatientId)

  // Filter patients based on search
  const filteredPatients = React.useMemo(() => {
    if (!patientSearch) return patients
    const search = patientSearch.toLowerCase()
    return patients.filter(p => 
      p.firstName.toLowerCase().includes(search) ||
      p.lastName.toLowerCase().includes(search) ||
      p.phone?.includes(search) ||
      p.fileNumber.toLowerCase().includes(search)
    )
  }, [patients, patientSearch])

  const handleFormSubmit = async (data: ConsultationFormData) => {
    await onSubmit(data)
  }

  const parseDateString = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined
    const [day, month, year] = dateStr.split('/').map(Number)
    if (!day || !month || !year) return undefined
    return new Date(year, month - 1, day)
  }

  const formatDateToString = (date: Date): string => {
    return format(date, 'dd/MM/yyyy')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-4', className)}>
      {/* Patient Selection Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPatientInfo ? (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div>
                <p className="font-medium">
                  {selectedPatientInfo.firstName} {selectedPatientInfo.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Dossier: {selectedPatientInfo.fileNumber}
                  {selectedPatientInfo.phone && ` • ${selectedPatientInfo.phone}`}
                </p>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue('patientId', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <Popover open={showPatientPicker} onOpenChange={setShowPatientPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    {watchedPatientId ? 'Patient sélectionné' : 'Sélectionner un patient...'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Rechercher par nom, téléphone ou numéro de dossier..."
                    value={patientSearch}
                    onValueChange={setPatientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>Aucun patient trouvé</CommandEmpty>
                    <CommandGroup>
                      {filteredPatients.slice(0, 20).map((patient) => (
                        <CommandItem
                          key={patient.id}
                          value={patient.id}
                          onSelect={() => {
                            setValue('patientId', patient.id)
                            setShowPatientPicker(false)
                            setPatientSearch('')
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {patient.fileNumber} {patient.phone && `• ${patient.phone}`}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          {errors.patientId && (
            <p className="text-sm text-destructive mt-1">{errors.patientId.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Date and Time */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Date et heure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input {...register('consultationDate')} placeholder="DD/MM/YYYY" />
              {errors.consultationDate && (
                <p className="text-sm text-destructive">{errors.consultationDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Heure</Label>
              <Input {...register('consultationTime')} type="time" />
            </div>
          </div>
          <div className="mt-3">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Statut</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <span className={cn('h-2 w-2 rounded-full', status.color)} />
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vitals Section */}
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 z-10"
          onClick={() => toggleSection('vitals')}
        >
          {expandedSections.vitals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {expandedSections.vitals && <VitalsInput />}
      </div>

      {/* Chief Complaint */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Motif de consultation
          </CardTitle>
          <CardDescription>
            Raison principale de la visite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Motif (Français) *</Label>
            <Textarea
              {...register('chiefComplaint')}
              placeholder="Ex: Douleur abdominale, fièvre, maux de tête..."
              rows={2}
            />
            {errors.chiefComplaint && (
              <p className="text-sm text-destructive">{errors.chiefComplaint.message}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="showArabic"
              checked={showArabicFields}
              onCheckedChange={(checked) => setShowArabicFields(checked as boolean)}
            />
            <Label htmlFor="showArabic" className="text-sm text-muted-foreground cursor-pointer">
              Ajouter la version arabe
            </Label>
          </div>
          {showArabicFields && (
            <div className="space-y-1.5">
              <Label>الم мотع العربية</Label>
              <Textarea
                {...register('chiefComplaintAr')}
                placeholder="سبب الزيارة بالعربية..."
                rows={2}
                dir="rtl"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Present Illness History */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('history')}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Histoire de la maladie
              </CardTitle>
              <CardDescription className="mt-1">
                Antécédents et évolution des symptômes
              </CardDescription>
            </div>
            {expandedSections.history ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.history && (
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Description (Français)</Label>
              <Textarea
                {...register('presentIllness')}
                placeholder="Décrivez l'évolution des symptômes, les traitements déjà essayés..."
                rows={4}
              />
            </div>
            {showArabicFields && (
              <div className="space-y-1.5">
                <Label>الوصف بالعربية</Label>
                <Textarea
                  {...register('presentIllnessAr')}
                  placeholder="وصف تطور الأعراض..."
                  rows={4}
                  dir="rtl"
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Examination Notes */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('examination')}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-secondary" />
                Examen clinique
              </CardTitle>
              <CardDescription className="mt-1">
                Notes et observations de l&apos;examen physique
              </CardDescription>
            </div>
            {expandedSections.examination ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.examination && (
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Notes (Français)</Label>
              <Textarea
                {...register('examinationNotes')}
                placeholder="Observations de l'examen physique..."
                rows={4}
              />
            </div>
            {showArabicFields && (
              <div className="space-y-1.5">
                <Label>ملاحظات بالعربية</Label>
                <Textarea
                  {...register('examinationNotesAr')}
                  placeholder="ملاحظات الفحص السريري..."
                  rows={4}
                  dir="rtl"
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Diagnosis */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('diagnosis')}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Diagnostic
              </CardTitle>
              <CardDescription className="mt-1">
                Conclusion diagnostique avec code CIM-10 optionnel
              </CardDescription>
            </div>
            {expandedSections.diagnosis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.diagnosis && (
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Diagnostic (Français)</Label>
              <Textarea
                {...register('diagnosis')}
                placeholder="Diagnostic principal et diagnostics différentiels..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Code CIM-10</Label>
              <Input
                {...register('icdCode')}
                placeholder="Ex: J06.9 (Infection respiratoire haute)"
              />
            </div>
            {showArabicFields && (
              <div className="space-y-1.5">
                <Label>التشخيص بالعربية</Label>
                <Textarea
                  {...register('diagnosisAr')}
                  placeholder="التشخيص الرئيسي..."
                  rows={3}
                  dir="rtl"
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Treatment Plan */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('treatment')}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Plan de traitement
              </CardTitle>
              <CardDescription className="mt-1">
                Médicaments, conseils et recommandations
              </CardDescription>
            </div>
            {expandedSections.treatment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.treatment && (
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Traitement (Français)</Label>
              <Textarea
                {...register('treatmentPlan')}
                placeholder="Médicaments prescrits, conseils hygiéno-diététiques..."
                rows={4}
              />
            </div>
            {showArabicFields && (
              <div className="space-y-1.5">
                <Label>العلاج بالعربية</Label>
                <Textarea
                  {...register('treatmentPlanAr')}
                  placeholder="الأدوية الموصوفة والنصائح..."
                  rows={4}
                  dir="rtl"
                />
              </div>
            )}
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date de suivi</Label>
                <Controller
                  name="followUpDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value || 'Sélectionner une date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? parseDateString(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(formatDateToString(date))
                            }
                          }}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Notes de suivi</Label>
                <Input {...register('followUpNotes')} placeholder="Examens à faire, etc." />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Payment Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('payment')}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Paiement
              </CardTitle>
              <CardDescription className="mt-1">
                Honoraires et modalités de paiement
              </CardDescription>
            </div>
            {expandedSections.payment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSections.payment && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Honoraires (DA)</Label>
                <Input
                  {...register('fee', { valueAsNumber: true })}
                  type="number"
                  placeholder="2000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mode de paiement</Label>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="paid"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="paid"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="paid" className="cursor-pointer">
                Payé
              </Label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Additional Notes */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes supplémentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Autres remarques ou informations importantes..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isLoading}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Enregistrer les modifications' : 'Enregistrer la consultation'}
        </Button>
      </div>
    </form>
  )
}

export default ConsultationForm
