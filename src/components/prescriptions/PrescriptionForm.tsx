'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PrescriptionSchema } from '@/lib/validations/schemas'
import { format } from 'date-fns'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  User,
  FileText,
  Plus,
  Save,
  Printer,
  Search,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { MedicationItem, type Medication } from './MedicationItem'

export type PrescriptionFormData = z.infer<typeof PrescriptionSchema>

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  fileNumber: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE'
}

interface ConsultationOption {
  id: string
  consultationDate: string
  chiefComplaint: string
  diagnosis?: string | null
}

interface PrescriptionFormProps {
  patients?: PatientOption[]
  selectedPatient?: PatientOption
  consultations?: ConsultationOption[]
  selectedConsultation?: ConsultationOption
  defaultValues?: Partial<PrescriptionFormData>
  onSubmit: (data: PrescriptionFormData) => Promise<void>
  onPrint?: (data: PrescriptionFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  isLoading?: boolean
  className?: string
}

// Generate unique ID for medications
const generateId = () => `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export function PrescriptionForm({
  patients = [],
  selectedPatient,
  consultations = [],
  selectedConsultation,
  defaultValues,
  onSubmit,
  onPrint,
  onCancel,
  isEditing = false,
  isLoading = false,
  className,
}: PrescriptionFormProps) {
  const [showArabicFields, setShowArabicFields] = React.useState(false)
  const [patientSearch, setPatientSearch] = React.useState('')
  const [showPatientPicker, setShowPatientPicker] = React.useState(false)
  const [editingMedicationId, setEditingMedicationId] = React.useState<string | null>(null)
  const [items, setItems] = React.useState<Medication[]>(
    (defaultValues?.items || []).map((item, index) => ({
      ...item,
      id: item.id || generateId(),
      medicationName: item.medicationName || '',
      dosage: item.dosage || '',
      frequency: item.frequency || '',
      duration: item.duration || '',
      renewal: item.renewal ?? false,
      order: item.order ?? index,
    }))
  )

  // Get today's date in DD/MM/YYYY format
  const today = format(new Date(), 'dd/MM/yyyy')

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(PrescriptionSchema) as any,
    defaultValues: {
      patientId: selectedPatient?.id || defaultValues?.patientId || '',
      consultationId: selectedConsultation?.id || defaultValues?.consultationId || '',
      prescriptionDate: defaultValues?.prescriptionDate || today,
      diagnosis: defaultValues?.diagnosis || '',
      notes: defaultValues?.notes || '',
      items: (defaultValues?.items || []) as any,
    },
  })

  // Set patient when selected from picker
  React.useEffect(() => {
    if (selectedPatient) {
      setValue('patientId', selectedPatient.id)
    }
  }, [selectedPatient, setValue])

  // Set consultation when selected
  React.useEffect(() => {
    if (selectedConsultation) {
      setValue('consultationId', selectedConsultation.id)
      if (selectedConsultation.diagnosis) {
        setValue('diagnosis', selectedConsultation.diagnosis)
      }
    }
  }, [selectedConsultation, setValue])

  // Sync items with form
  React.useEffect(() => {
    // Cast to any to avoid complex schema mismatch if any small difference remains
    setValue('items', items as any)
  }, [items, setValue])

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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end for medication reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        // Update order property
        return newItems.map((item, index) => ({ ...item, order: index }))
      })
    }
  }

  // Add new medication
  const addMedication = () => {
    const newMed: Medication = {
      id: generateId(),
      medicationName: '',
      medicationNameAr: '',
      dosage: '',
      frequency: '',
      frequencyAr: '',
      duration: '',
      durationAr: '',
      quantity: '',
      instructions: '',
      instructionsAr: '',
      renewal: false,
      order: items.length,
    }
    setItems([...items, newMed])
    setEditingMedicationId(newMed.id)
  }

  // Remove medication
  const removeMedication = (id: string) => {
    setItems(items.filter((m) => m.id !== id))
  }

  // Save medication edits
  const saveMedication = (updatedMed: Medication) => {
    setItems(items.map((m) => (m.id === updatedMed.id ? updatedMed : m)))
    setEditingMedicationId(null)
  }

  const handleFormSubmit = async (data: PrescriptionFormData) => {
    try {
      // Include items from state with correct order
      const formData = {
        ...data,
        items: items.map((m, index) => ({ ...m, order: index })),
      }
      await onSubmit(formData as PrescriptionFormData)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handlePrint = () => {
    const data = {
      patientId: watchedPatientId,
      prescriptionDate: watch('prescriptionDate'),
      diagnosis: watch('diagnosis'),
      notes: watch('notes'),
      consultationId: watch('consultationId'),
      items,
    }
    onPrint?.(data as any)
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
                  Changer
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

      {/* Date and Diagnosis */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Ordonnance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input {...register('prescriptionDate')} placeholder="DD/MM/YYYY" />
              {errors.prescriptionDate && (
                <p className="text-sm text-destructive">{errors.prescriptionDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Consultation associée</Label>
              <Controller
                name="consultationId"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {field.value
                          ? consultations.find(c => c.id === field.value)?.consultationDate || 'Sélectionner'
                          : 'Aucune'
                        }
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher..." />
                        <CommandList>
                          <CommandEmpty>Aucune consultation</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => field.onChange('')}
                            >
                              Aucune
                            </CommandItem>
                            {consultations.map((consultation) => (
                              <CommandItem
                                key={consultation.id}
                                value={consultation.id}
                                onSelect={() => {
                                  field.onChange(consultation.id)
                                  if (consultation.diagnosis) {
                                    setValue('diagnosis', consultation.diagnosis)
                                  }
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{consultation.consultationDate}</span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {consultation.chiefComplaint}
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
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Diagnostic</Label>
            <Textarea
              {...register('diagnosis')}
              placeholder="Diagnostic pour cette ordonnance..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medications Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Médicaments</CardTitle>
              <CardDescription className="mt-1">
                Glisser-déposer pour réorganiser
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showArabic"
                  checked={showArabicFields}
                  onCheckedChange={(checked) => setShowArabicFields(checked as boolean)}
                />
                <Label htmlFor="showArabic" className="text-sm text-muted-foreground cursor-pointer">
                  Arabe
                </Label>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addMedication}
                disabled={items.length >= 10}
              >
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">Aucun médicament ajouté</p>
              <Button type="button" variant="outline" onClick={addMedication}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter un médicament
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((medication) => (
                    <MedicationItem
                      key={medication.id}
                      medication={medication}
                      isEditing={editingMedicationId === medication.id}
                      onEdit={() => setEditingMedicationId(medication.id)}
                      onSave={(updated) => saveMedication(updated)}
                      onCancel={() => setEditingMedicationId(null)}
                      onDelete={() => removeMedication(medication.id)}
                      showArabicFields={showArabicFields}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          {errors.items && (
            <p className="text-sm text-destructive mt-2">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Notes supplémentaires..."
            rows={2}
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
        {onPrint && items.length > 0 && (
          <Button type="button" variant="outline" onClick={handlePrint} disabled={isSubmitting || isLoading}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isLoading || items.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Enregistrer les modifications' : 'Enregistrer l\'ordonnance'}
        </Button>
      </div>
    </form>
  )
}

export default PrescriptionForm
