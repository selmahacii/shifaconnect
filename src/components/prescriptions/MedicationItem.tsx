'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Trash2,
  Edit2,
  Check,
  X,
  Pill,
  Clock,
  Calendar,
  Hash,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MEDICATION_FORMS, searchMedications, COMMON_FREQUENCIES, COMMON_DURATIONS } from '@/lib/data/medications-dz'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ChevronsUpDown } from 'lucide-react'

export interface Medication {
  id: string
  medicationName: string
  medicationNameAr?: string
  dosage: string
  form?: string // Forme galénique
  frequency: string
  frequencyAr?: string
  duration: string
  durationAr?: string
  quantity?: string // Changed to string for flexibility like "1 boîte", "2 flacons"
  instructions?: string
  instructionsAr?: string
  renewal?: boolean // Renouvellement autorisé
  order?: number
}

interface MedicationItemProps {
  medication: Medication
  isEditing?: boolean
  onEdit?: () => void
  onSave?: (medication: Medication) => void
  onCancel?: () => void
  onDelete?: () => void
  showArabicFields?: boolean
  className?: string
}

export function MedicationItem({
  medication,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  showArabicFields = false,
  className,
}: MedicationItemProps) {
  const [editData, setEditData] = React.useState<Medication>(medication)
  const [medicationSearch, setMedicationSearch] = React.useState(medication.medicationName)
  const [showMedicationPicker, setShowMedicationPicker] = React.useState(false)
  const [filteredMedications, setFilteredMedications] = React.useState<ReturnType<typeof searchMedications>>([])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: medication.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Update filtered medications when search changes
  React.useEffect(() => {
    if (medicationSearch.length >= 2) {
      setFilteredMedications(searchMedications(medicationSearch, 10))
    } else {
      setFilteredMedications([])
    }
  }, [medicationSearch])

  const handleSave = () => {
    onSave?.(editData)
  }

  const handleCancel = () => {
    setEditData(medication)
    onCancel?.()
  }

  const updateField = (field: keyof Medication, value: string | boolean | undefined) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  // When a medication is selected from autocomplete
  const handleMedicationSelect = (medName: string) => {
    updateField('medicationName', medName)
    setMedicationSearch(medName)
    setShowMedicationPicker(false)
  }

  if (isEditing) {
    return (
      <Card className={cn('border-primary/30', className)}>
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Medication Name + Dosage + Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5 relative">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Pill className="h-3 w-3" /> Médicament *
              </Label>
              <Popover open={showMedicationPicker} onOpenChange={setShowMedicationPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    {editData.medicationName || 'Sélectionner...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Rechercher un médicament..."
                      value={medicationSearch}
                      onValueChange={setMedicationSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {medicationSearch.length < 2 
                          ? 'Tapez au moins 2 caractères'
                          : 'Aucun médicament trouvé'
                        }
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredMedications.map((med) => (
                          <CommandItem
                            key={med.name}
                            value={med.name}
                            onSelect={() => handleMedicationSelect(med.name)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{med.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {med.category} • {med.dosages.slice(0, 3).join(', ')}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" /> Dosage *
              </Label>
              <Input
                value={editData.dosage}
                onChange={(e) => updateField('dosage', e.target.value)}
                placeholder="Ex: 500mg, 1 comprimé"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Forme galénique
              </Label>
              <Select
                value={editData.form || ''}
                onValueChange={(value) => updateField('form', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {MEDICATION_FORMS.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showArabicFields && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">اسم الدواء</Label>
              <Input
                value={editData.medicationNameAr || ''}
                onChange={(e) => updateField('medicationNameAr', e.target.value)}
                placeholder="اسم الدواء بالعربية"
                dir="rtl"
              />
            </div>
          )}

          {/* Row 2: Frequency + Duration + Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Posologie *
              </Label>
              <Input
                value={editData.frequency}
                onChange={(e) => updateField('frequency', e.target.value)}
                placeholder="Ex: 3 fois par jour"
                list="frequencies"
              />
              <datalist id="frequencies">
                {COMMON_FREQUENCIES.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Durée *
              </Label>
              <Input
                value={editData.duration}
                onChange={(e) => updateField('duration', e.target.value)}
                placeholder="Ex: 7 jours"
                list="durations"
              />
              <datalist id="durations">
                {COMMON_DURATIONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Quantité
              </Label>
              <Input
                value={editData.quantity || ''}
                onChange={(e) => updateField('quantity', e.target.value)}
                placeholder="Ex: 1 boîte, 2 flacons"
              />
            </div>
          </div>

          {showArabicFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">التكرار</Label>
                <Input
                  value={editData.frequencyAr || ''}
                  onChange={(e) => updateField('frequencyAr', e.target.value)}
                  placeholder="مرات في اليوم"
                  dir="rtl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">المدة</Label>
                <Input
                  value={editData.durationAr || ''}
                  onChange={(e) => updateField('durationAr', e.target.value)}
                  placeholder="أيام"
                  dir="rtl"
                />
              </div>
            </div>
          )}

          {/* Row 3: Instructions */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Instructions spéciales
            </Label>
            <Input
              value={editData.instructions || ''}
              onChange={(e) => updateField('instructions', e.target.value)}
              placeholder="Ex: À prendre après les repas"
            />
          </div>

          {showArabicFields && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">تعليمات</Label>
              <Input
                value={editData.instructionsAr || ''}
                onChange={(e) => updateField('instructionsAr', e.target.value)}
                placeholder="بعد الأكل"
                dir="rtl"
              />
            </div>
          )}

          {/* Row 4: Renewal checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id={`renewal-${medication.id}`}
              checked={editData.renewal || false}
              onCheckedChange={(checked) => updateField('renewal', checked as boolean)}
            />
            <Label
              htmlFor={`renewal-${medication.id}`}
              className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Renouvellement autorisé
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" /> Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-shadow',
        isDragging && 'shadow-lg opacity-90 z-50',
        className
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium text-primary truncate">
                  {medication.medicationName}
                </h4>
                {medication.medicationNameAr && (
                  <p className="text-sm text-muted-foreground" dir="rtl">
                    {medication.medicationNameAr}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onEdit}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Pill className="h-3 w-3 mr-1" />
                {medication.dosage}
              </Badge>
              {medication.form && (
                <Badge variant="outline" className="text-xs bg-muted/50">
                  {medication.form}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {medication.frequency}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {medication.duration}
              </Badge>
              {medication.quantity && (
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {medication.quantity}
                </Badge>
              )}
              {medication.renewal && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Renouvelable
                </Badge>
              )}
            </div>

            {medication.instructions && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                {medication.instructions}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MedicationItem
