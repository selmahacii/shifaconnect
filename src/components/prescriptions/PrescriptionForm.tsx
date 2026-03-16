
'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Save, 
  FileText, 
  Search,
  Check,
  ChevronDown,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { PrescriptionSchema, PrescriptionSchemaType } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'
import { MEDICATIONS_DZ } from '@/lib/data/medications-dz'
import { cn } from '@/lib/utils'
import { pdf } from '@react-pdf/renderer'
import { PrescriptionPDF } from './PrescriptionPDF'

interface PrescriptionFormProps {
  patientId: string
  patientName: string
  consultationId?: string
  onSuccess?: () => void
}

const GALENIC_FORMS = [
  "Comprimé", 
  "Gélule", 
  "Sirop", 
  "Injectable", 
  "Sachet", 
  "Suppositoire", 
  "Pommade", 
  "Collyre", 
  "Spray", 
  "Patch"
]

export function PrescriptionForm({ patientId, patientName, consultationId, onSuccess }: PrescriptionFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<PrescriptionSchemaType>({
    resolver: zodResolver(PrescriptionSchema),
    defaultValues: {
      patientId,
      consultationId: consultationId || '',
      prescriptionDate: new Date().toISOString().split('T')[0],
      items: [
        {
          medicationName: '',
          dosage: '',
          form: 'Comprimé',
          frequency: '',
          duration: '',
          quantity: '1 boîte',
          instructions: '',
          renewal: false,
        }
      ],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items" as any
  })

  async function onSubmit(data: any) {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (!doctor) throw new Error('Profil docteur non trouvé')

      // 1. Fetch patient full details for PDF
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (!patient) throw new Error('Patient non trouvé')

      // 2. Save Prescription to DB
      const { data: prescription, error: pError } = await (supabase.from('prescriptions') as any)
        .insert({
          patient_id: patientId,
          doctor_id: (doctor as any).id,
          consultation_id: consultationId || null,
          prescription_date: data.prescriptionDate,
          medications: data.items,
          instructions: data.notes || null,
        })
        .select()
        .single()

      if (pError) throw pError

      // 3. Generate PDF
      setIsGeneratingPdf(true)
      const blob = await pdf(
        <PrescriptionPDF 
          doctor={doctor}
          patient={patient}
          medications={data.items}
          generalInstructions={data.notes}
          date={data.prescriptionDate}
          prescriptionNumber={prescription.id.slice(0,8).toUpperCase()}
        />
      ).toBlob()

      // 4. Upload PDF to Storage
      const fileName = `prescriptions/${prescription.id}.pdf`
      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) {
        console.error('PDF Upload error:', uploadError)
        // We don't throw here, just warn, as the record is saved
        toast.warning('Prescription sauvegardée mais erreur d\'upload du PDF')
      } else {
        // Update URL
        const { data: { publicUrl } } = supabase.storage.from('medical-documents').getPublicUrl(fileName)
        await (supabase.from('prescriptions') as any)
          .update({ pdf_url: publicUrl })
          .eq('id', prescription.id)
      }

      toast.success('Ordonnance enregistrée avec succès')
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/dashboard/prescriptions/${prescription.id}`)
        router.refresh()
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
      setIsGeneratingPdf(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 uppercase">Patient</Label>
            <p className="font-bold text-slate-900">{patientName}</p>
          </div>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="prescriptionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-500 uppercase">Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1B4F72] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Médicaments
            </h3>
            <Badge variant="outline">{fields.length} / 10</Badge>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="relative overflow-hidden border-slate-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Medication Name Autocomplete */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.medicationName`}
                        render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <FormLabel>Nom du médicament</FormLabel>
                            <MedicationSearch 
                              value={field.value} 
                              onSelect={(med) => {
                                field.onChange(med.name)
                                // Pre-fill first dosage and form if available
                                if (med.dosages.length > 0) form.setValue(`items.${index}.dosage`, med.dosages[0])
                                if (med.forms.length > 0) form.setValue(`items.${index}.form`, med.forms[0])
                              }} 
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosage</FormLabel>
                            <FormControl>
                              <Input placeholder="ex: 500mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.form`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Forme</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {GALENIC_FORMS.map(f => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posologie / Fréquence</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: 1 mat/soir" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: 7 jours" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: 1 boîte" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end pb-2">
                       <FormField
                        control={form.control}
                        name={`items.${index}.renewal`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs font-medium cursor-pointer">Renouvellement</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Instructions spéciales (ex: Avant repas)..." {...field} className="text-xs h-8" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-dashed border-2 text-slate-500 hover:text-[#1B4F72] hover:border-[#1B4F72]/50"
            disabled={fields.length >= 10}
            onClick={() => append({
              medicationName: '',
              dosage: '',
              form: 'Comprimé',
              frequency: '',
              duration: '',
              quantity: '1 boîte',
              instructions: '',
              renewal: false,
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un médicament
          </Button>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions générales / Conseils</FormLabel>
              <FormControl>
                <Textarea placeholder="Repos, régime sans sel, éviter le soleil..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="submit" className="bg-[#1B4F72] hover:bg-[#153e5a] px-8" disabled={isLoading || isGeneratingPdf}>
            {isLoading || isGeneratingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGeneratingPdf ? 'Génération du PDF...' : 'Enregistrement...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer & Générer l'ordonnance
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function MedicationSearch({ value, onSelect }: { value: string, onSelect: (med: any) => void }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value ? value : "Rechercher un médicament..."}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tapez le nom d'un médicament..." />
          <CommandList>
            <CommandEmpty>Aucun médicament trouvé.</CommandEmpty>
            <CommandGroup>
              {MEDICATIONS_DZ.map((med) => (
                <CommandItem
                  key={med.name}
                  value={med.name}
                  onSelect={() => {
                    onSelect(med)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === med.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <p>{med.name}</p>
                    <p className="text-[10px] text-slate-400">{med.forms[0]} • {med.dosages[0]}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}>
      {children}
    </div>
  )
}

function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'outline', className?: string }) {
  const variants = {
    default: "bg-[#1B4F72] text-white border-transparent",
    outline: "border-slate-300 text-slate-600 bg-transparent",
  }
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
      {children}
    </div>
  )
}
